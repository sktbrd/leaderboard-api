import { NextRequest, NextResponse } from 'next/server';
import { fetchHighestPaidPosts, HighestPaidPost } from '@/app/utils/hive/fetchHighestPaidPosts';
import { getHighestPaidCache } from '@/app/api/cron/highest-paid/route';

// Module-level cache with TTL tracking
interface CacheEntry {
  data: HighestPaidPost[];
  total: number;
  timestamp: number;
}

const localCache: Map<string, CacheEntry> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes local cache TTL

/**
 * GET /api/v2/highest-paid
 * 
 * Returns the highest paid posts ever from the SkateHive community.
 * 
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Posts per page (default: 25, max: 100)
 * - community: Community code (default: hive-173115)
 * - minPayout: Minimum total payout filter (optional)
 * - author: Filter by author (optional)
 * 
 * Response:
 * - posts: Array of highest paid posts sorted by total payout
 * - pagination: { page, limit, total, totalPages }
 * - cacheInfo: { lastUpdated, source }
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(Math.max(1, Number(searchParams.get('limit')) || 25), 100);
    const community = searchParams.get('community') || 'hive-173115';
    const minPayout = Number(searchParams.get('minPayout')) || 0;
    const authorFilter = searchParams.get('author')?.toLowerCase();
    
    const offset = (page - 1) * limit;
    const cacheKey = `highest-paid:${community}:${page}:${limit}:${minPayout}:${authorFilter || ''}`;
    
    let posts: HighestPaidPost[] = [];
    let total = 0;
    let cacheSource = 'fresh';
    let cacheLastUpdated: Date | null = null;

    // Try to get data from the global cron cache first
    const globalCache = getHighestPaidCache();
    
    if (globalCache && globalCache.data.length > 0) {
      // Use global cache data
      let filteredData = globalCache.data;
      
      // Apply filters
      if (minPayout > 0) {
        filteredData = filteredData.filter(post => post.total_payout >= minPayout);
      }
      if (authorFilter) {
        filteredData = filteredData.filter(post => 
          post.author.toLowerCase().includes(authorFilter)
        );
      }
      
      total = filteredData.length;
      posts = filteredData.slice(offset, offset + limit);
      cacheSource = 'global';
      cacheLastUpdated = globalCache.lastUpdated;
      
      console.log(`📁 Using global cache (${globalCache.data.length} posts, updated ${globalCache.lastUpdated.toISOString()})`);
    } else {
      // Check local cache
      const cached = localCache.get(cacheKey);
      const now = Date.now();
      
      if (cached && (now - cached.timestamp) < CACHE_TTL) {
        posts = cached.data;
        total = cached.total;
        cacheSource = 'local';
        cacheLastUpdated = new Date(cached.timestamp);
        console.log(`📁 Using local cache for: ${cacheKey}`);
      } else {
        // Fetch fresh data from database
        console.log(`🔄 Fetching fresh data for: ${cacheKey}`);
        const result = await fetchHighestPaidPosts(limit, offset, community);
        
        // Apply additional filters
        let filteredRows = result.rows;
        if (minPayout > 0) {
          filteredRows = filteredRows.filter(post => post.total_payout >= minPayout);
        }
        if (authorFilter) {
          filteredRows = filteredRows.filter(post => 
            post.author.toLowerCase().includes(authorFilter)
          );
        }
        
        posts = filteredRows;
        total = result.total;
        cacheLastUpdated = new Date();
        
        // Update local cache
        localCache.set(cacheKey, {
          data: posts,
          total,
          timestamp: now
        });
        
        // Cleanup old cache entries
        for (const [key, value] of localCache.entries()) {
          if (now - value.timestamp > CACHE_TTL * 2) {
            localCache.delete(key);
          }
        }
      }
    }

    const executionTime = Date.now() - startTime;

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      },
      cacheInfo: {
        source: cacheSource,
        lastUpdated: cacheLastUpdated?.toISOString() || null,
        executionTimeMs: executionTime
      },
      filters: {
        community,
        minPayout: minPayout > 0 ? minPayout : null,
        author: authorFilter || null
      }
    }, {
      headers: {
        'Cache-Control': 's-maxage=300, stale-while-revalidate=600',
        'X-Cache-Source': cacheSource,
        'X-Execution-Time': `${executionTime}ms`
      }
    });

  } catch (error) {
    console.error('❌ Error fetching highest paid posts:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch highest paid posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store'
      }
    });
  }
}
