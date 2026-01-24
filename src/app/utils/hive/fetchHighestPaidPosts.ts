import { HAFSQL_Database } from '@/lib/hafsql_database';

const db = new HAFSQL_Database();

export interface HighestPaidPost {
    author: string;
    permlink: string;
    title: string;
    body: string;
    created: Date;
    total_payout: number;
    pending_payout: number;
    author_rewards: number;
    curator_payout: number;
    total_votes: number;
    json_metadata: string;
    url: string;
    thumbnail: string | null;
}

/**
 * Fetches the highest paid posts of all time from the SkateHive community (hive-173115)
 * This queries all posts ever made in the community and ranks them by total payout
 */
export async function fetchHighestPaidPosts(
    limit: number = 100,
    offset: number = 0,
    community: string = 'hive-173115'
): Promise<{ rows: HighestPaidPost[]; total: number }> {
    // First get total count of posts with any payout
    const countQuery = `
    SELECT COUNT(*) AS total
    FROM comments c
    WHERE c.category = @community
      AND c.deleted = false
      AND c.parent_author = ''
      AND (c.total_payout_value + c.curator_payout_value + c.pending_payout_value) > 0;
  `;

    const countResult = await db.executeQuery(countQuery, [
        { name: 'community', value: community }
    ]);
    const total = parseInt(countResult.rows[0]?.total || '0', 10);

    // Fetch the highest paid posts
    // Total payout = total_payout_value (author HBD) + curator_payout_value + pending_payout_value
    // Note: author_rewards_in_hive is NOT added as it would double-count (already in total_payout_value)
    const query = `
    SELECT 
      c.author,
      c.permlink,
      c.title,
      c.body,
      c.created,
      c.json_metadata,
      c.pending_payout_value AS pending_payout,
      c.total_payout_value AS author_payout,
      c.curator_payout_value AS curator_payout,
      (c.total_payout_value + c.curator_payout_value + c.pending_payout_value) AS total_payout,
      (
        SELECT COUNT(*) 
        FROM operation_effective_comment_vote_view v 
        WHERE v.author = c.author 
        AND v.permlink = c.permlink
      ) AS total_votes
    FROM comments c
    WHERE c.category = @community
      AND c.deleted = false
      AND c.parent_author = ''
    ORDER BY (c.total_payout_value + c.curator_payout_value + c.pending_payout_value) DESC
    LIMIT @limit
    OFFSET @offset;
  `;

    const { rows } = await db.executeQuery(query, [
        { name: 'community', value: community },
        { name: 'limit', value: limit },
        { name: 'offset', value: offset }
    ]);

    const formattedRows: HighestPaidPost[] = rows.map(row => {
        // Extract thumbnail from json_metadata, use title from column
        let thumbnail: string | null = null;
        try {
            const metadata = typeof row.json_metadata === 'string'
                ? JSON.parse(row.json_metadata)
                : row.json_metadata;
            thumbnail = metadata?.image?.[0] || null;
        } catch {
            // Ignore parsing errors
        }

        // Use title from DB column, fallback to extracting from body
        let title = row.title || '';
        if (!title && row.body) {
            const bodyLines = row.body.split('\n') || [];
            title = bodyLines[0]?.replace(/^#\s*/, '').slice(0, 100) || '';
        }

        return {
            author: row.author,
            permlink: row.permlink,
            title,
            body: row.body?.slice(0, 500) + (row.body?.length > 500 ? '...' : ''), // Truncate body
            created: row.created,
            total_payout: parseFloat(row.total_payout) || 0,
            pending_payout: parseFloat(row.pending_payout) || 0,
            author_rewards: parseFloat(row.author_payout) || 0,
            curator_payout: parseFloat(row.curator_payout) || 0,
            total_votes: parseInt(row.total_votes) || 0,
            json_metadata: row.json_metadata,
            url: `/@${row.author}/${row.permlink}`,
            thumbnail
        };
    });

    return { rows: formattedRows, total };
}

/**
 * Fetches the highest paid posts with additional ranking metadata
 * Used by the cron job to store in cache/database
 */
export async function fetchHighestPaidPostsWithRanking(
    limit: number = 500,
    community: string = 'hive-173115'
): Promise<HighestPaidPost[]> {
    const { rows } = await fetchHighestPaidPosts(limit, 0, community);
    return rows;
}
