import { NextResponse } from 'next/server';
import { fetchHighestPaidPostsWithRanking, HighestPaidPost } from '@/app/utils/hive/fetchHighestPaidPosts';

// In-memory cache for highest paid posts
// In production, consider using Redis, Supabase, or Vercel KV for persistence
interface CacheEntry {
    data: HighestPaidPost[];
    lastUpdated: Date;
    totalPosts: number;
}

// Global cache - persists across requests on same Vercel instance
declare global {
    // eslint-disable-next-line no-var
    var highestPaidCache: CacheEntry | null;
}

global.highestPaidCache = global.highestPaidCache || null;

/**
 * Cron endpoint to update the highest paid posts cache
 * 
 * This endpoint should be called periodically (every 10-30 minutes) by:
 * - Vercel Cron Jobs (vercel.json)
 * - External cron service (cron-job.org, etc.)
 * - GitHub Actions scheduled workflow
 * 
 * GET /api/cron/highest-paid
 * 
 * Query params:
 * - limit: Number of posts to fetch (default: 500, max: 1000)
 * - community: Community code (default: hive-173115)
 */
export async function GET(request: Request) {
    const startTime = Date.now();

    try {
        const { searchParams } = new URL(request.url);
        const limit = Math.min(
            Number(searchParams.get('limit')) || 500,
            1000 // Max limit to prevent abuse
        );
        const community = searchParams.get('community') || 'hive-173115';

        console.log(`🔄 Starting highest paid posts cache update...`);
        console.log(`   Community: ${community}, Limit: ${limit}`);

        // Fetch the highest paid posts
        const posts = await fetchHighestPaidPostsWithRanking(limit, community);

        // Update the global cache
        global.highestPaidCache = {
            data: posts,
            lastUpdated: new Date(),
            totalPosts: posts.length
        };

        const duration = Date.now() - startTime;
        console.log(`✅ Cache updated successfully in ${duration}ms`);
        console.log(`   Total posts cached: ${posts.length}`);
        console.log(`   Top earner: @${posts[0]?.author} - $${posts[0]?.total_payout.toFixed(2)}`);

        return NextResponse.json({
            success: true,
            message: 'Highest paid posts cache updated successfully',
            stats: {
                totalPosts: posts.length,
                lastUpdated: global.highestPaidCache.lastUpdated.toISOString(),
                executionTimeMs: duration,
                topPost: posts[0] ? {
                    author: posts[0].author,
                    permlink: posts[0].permlink,
                    totalPayout: posts[0].total_payout
                } : null
            }
        }, {
            headers: {
                'Cache-Control': 'no-store'
            }
        });

    } catch (error) {
        const duration = Date.now() - startTime;
        console.error('❌ Failed to update highest paid posts cache:', error);

        return NextResponse.json({
            success: false,
            error: 'Failed to update cache',
            details: error instanceof Error ? error.message : 'Unknown error',
            executionTimeMs: duration
        }, {
            status: 500,
            headers: {
                'Cache-Control': 'no-store'
            }
        });
    }
}

/**
 * Export function to get cached data from other routes
 */
export function getHighestPaidCache(): CacheEntry | null {
    return global.highestPaidCache;
}
