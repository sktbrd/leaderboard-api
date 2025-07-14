import { NextResponse } from 'next/server';
import { HAFSQL_Database } from '@/lib/hafsql_database';

const db = new HAFSQL_Database();

const parent_author = process.env.parent_author || "xvlad"
const parent_permlink = process.env.parent_permlink || "nxvsjarvmp"
const DEFAULT_PAGE = Number(process.env.DEFAULT_PAGE) || 1;
const DEFAULT_FEED_LIMIT = Number(process.env.DEFAULT_FEED_LIMIT) || 25;

export async function GET(request: Request) {
  try {
    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || Number(DEFAULT_PAGE));
    const limit = Math.max(1, Number(searchParams.get('limit')) || Number(DEFAULT_FEED_LIMIT));
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const [totalRows] = await db.executeQuery(`
      SELECT COUNT(*) as total
      FROM comments c
      WHERE c.parent_author = '${parent_author}' 
      AND c.parent_permlink = '${parent_permlink}'
    `);
    
    const total = parseInt(totalRows[0].total as any);

    // Get paginated data
    const [rows, headers] = await db.executeQuery(`
      SELECT 
        c.title, 
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
      WHERE c.parent_author = '${parent_author}' 
      AND c.parent_permlink = '${parent_permlink}'
      AND c.deleted = false
      GROUP BY 
        c.title, 
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
      LIMIT ${limit}
      OFFSET ${offset};
    `);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      { 
        success: true, 
        data: rows,
        headers: headers,
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
      { status: 200 }
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