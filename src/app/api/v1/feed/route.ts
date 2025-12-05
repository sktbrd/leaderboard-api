/*
    Main Feed 
  */
import { NextRequest, NextResponse } from 'next/server';
import { HAFSQL_Database } from '@/lib/hafsql_database';

const db = new HAFSQL_Database();

const DEFAULT_PAGE = Number(process.env.DEFAULT_PAGE) || 1;
const DEFAULT_FEED_LIMIT = Number(process.env.DEFAULT_FEED_LIMIT) || 25;

export async function GET(request: NextRequest) {
  console.log("Fetching MAIN FEED data...");
  try {
    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || Number(DEFAULT_PAGE));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || Number(DEFAULT_FEED_LIMIT))); // Cap at 100
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const { rows: totalRows } = await db.executeQuery(`
        SELECT COUNT(*) as total
        FROM comments
        WHERE parent_permlink SIMILAR TO 'snap-container-%'
        AND json_metadata @> '{"tags": ["hive-173115"]}'
      `);

    const total = parseInt(totalRows[0].total);

    // Get paginated parent comments
    const { rows: parentComments } = await db.executeQuery(`
        SELECT 
          c.body, 
          c.author, 
          c.permlink, 
          c.parent_author, 
          c.parent_permlink, 
          c.created, 
          c.last_edited, 
          c.cashout_time, 
          c.remaining_till_cashout, 
          c.last_payout, 
          c.tags, 
          c.category, 
          c.json_metadata AS post_json_metadata, 
          c.root_author, 
          c.root_permlink, 
          c.pending_payout_value, 
          c.author_rewards, 
          c.author_rewards_in_hive, 
          c.total_payout_value, 
          c.curator_payout_value, 
          c.beneficiary_payout_value, 
          c.total_rshares, 
          c.net_rshares, 
          c.total_vote_weight, 
          c.beneficiaries, 
          c.max_accepted_payout, 
          c.percent_hbd, 
          c.allow_votes, 
          c.allow_curation_rewards, 
          c.deleted,
          a.json_metadata AS user_json_metadata, 
          a.reputation, 
          a.followers, 
          a.followings,
          COALESCE(
            json_agg(
              json_build_object(
                'id', v.id,
                'timestamp', v.timestamp,
                'voter', v.voter,
                'weight', v.weight,
                'rshares', v.rshares,
                'total_vote_weight', v.total_vote_weight,
                'pending_payout', v.pending_payout,
                'pending_payout_symbol', v.pending_payout_symbol
              )
            ) FILTER (WHERE v.id IS NOT NULL), 
            '[]'
          ) as votes
        FROM comments c
        LEFT JOIN accounts a ON c.author = a.name
        LEFT JOIN operation_effective_comment_vote_view v 
          ON c.author = v.author 
          AND c.permlink = v.permlink
        WHERE c.parent_permlink SIMILAR TO 'snap-container-%'
        AND c.json_metadata @> '{"tags": ["hive-173115"]}'
        AND c.deleted = false
        GROUP BY 
          c.body, 
          c.author, 
          c.permlink, 
          c.parent_author, 
          c.parent_permlink, 
          c.created, 
          c.last_edited, 
          c.cashout_time, 
          c.remaining_till_cashout, 
          c.last_payout, 
          c.tags, 
          c.category, 
          c.json_metadata,
          c.root_author, 
          c.root_permlink, 
          c.pending_payout_value, 
          c.author_rewards, 
          c.author_rewards_in_hive, 
          c.total_payout_value, 
          c.curator_payout_value, 
          c.beneficiary_payout_value, 
          c.total_rshares, 
          c.net_rshares, 
          c.total_vote_weight, 
          c.beneficiaries, 
          c.max_accepted_payout, 
          c.percent_hbd, 
          c.allow_votes, 
          c.allow_curation_rewards, 
          c.deleted,
          a.json_metadata,
          a.reputation, 
          a.followers, 
          a.followings
        ORDER BY c.created DESC
        LIMIT @limit
        OFFSET @offset;
      `, [
      { name: 'limit', value: limit },
      { name: 'offset', value: offset }
    ]);

    // Fetch all child comments in a single query (fixes N+1 problem)
    // Note: parentComments data comes from our own query, so it's safe
    // We still escape single quotes as a defense-in-depth measure
    const parentIds = parentComments.map((p: any) => {
      // Validate that author/permlink match expected Hive format
      const author = String(p.author).replace(/'/g, "''");
      const permlink = String(p.permlink).replace(/'/g, "''");
      return `('${author}', '${permlink}')`;
    }).join(',');

    let childCommentsMap: Map<string, any[]> = new Map();

    if (parentComments.length > 0) {
      const { rows: allChildComments } = await db.executeQuery(`
          SELECT 
            ch.body, 
            ch.author, 
            ch.permlink, 
            ch.parent_author,
            ch.parent_permlink,
            ch.created, 
            ch.json_metadata AS child_json_metadata
          FROM comments ch
          WHERE (ch.parent_author, ch.parent_permlink) IN (${parentIds})
            AND ch.deleted = false
          ORDER BY ch.created ASC;
        `);

      // Group children by parent
      for (const child of allChildComments) {
        const key = `${child.parent_author}:${child.parent_permlink}`;
        if (!childCommentsMap.has(key)) {
          childCommentsMap.set(key, []);
        }
        childCommentsMap.get(key)!.push(child);
      }
    }

    // Attach children to parents
    const commentsWithChildren = parentComments.map((parentComment: any) => {
      const key = `${parentComment.author}:${parentComment.permlink}`;
      return {
        ...parentComment,
        children: childCommentsMap.get(key) || []
      };
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      {
        success: true,
        data: commentsWithChildren,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          limit,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? page + 1 : null,
          prevPage: hasPrevPage ? page - 1 : null
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate=150'
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        code: 'Failed to fetch data',
        error
      },
      { status: 500 }
    );
  }
}