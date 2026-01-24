import { HighestPaidPost } from '@/app/utils/hive/fetchHighestPaidPosts';

// In-memory cache for highest paid posts
// In production, consider using Redis, Supabase, or Vercel KV for persistence
export interface CacheEntry {
    data: HighestPaidPost[];
    lastUpdated: Date;
    totalPosts: number;
}

// Global cache - persists across requests on same Vercel instance
declare global {
    var highestPaidCache: CacheEntry | null;
}

global.highestPaidCache = global.highestPaidCache || null;

/**
 * Get the current highest paid posts cache
 */
export function getHighestPaidCache(): CacheEntry | null {
    return global.highestPaidCache;
}

/**
 * Set/update the highest paid posts cache
 */
export function setHighestPaidCache(posts: HighestPaidPost[]): void {
    global.highestPaidCache = {
        data: posts,
        lastUpdated: new Date(),
        totalPosts: posts.length
    };
}
