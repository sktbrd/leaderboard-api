/*
  Main Feed 
 */
import { NextResponse } from 'next/server';
import { HAFSQL_Database } from '@/lib/hafsql_database';
import { HiveSQL_Database } from '@/lib/hivesql_database';

export async function GET(request: Request) {
  console.log("Fetching MAIN FEED data...");

  const { searchParams } = new URL(request.url);
  const COMMUNITY = searchParams.get('community_code') || process.env.MY_COMMUNITY_CATEGORY || 'hive-173115';
  const TAG_FILTER = `"tags": ["${COMMUNITY}"]`;
  const DEFAULT_PAGE = Number(process.env.DEFAULT_PAGE) || 1;
  const DEFAULT_FEED_LIMIT = Number(process.env.DEFAULT_FEED_LIMIT) || 25;
  const PARENT_PERMLINK = process.env.PARENT_PERMLINK

  try {
    const db = new HAFSQL_Database();
    await db.testConnection();

    // Get pagination parameters from URL
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || Number(DEFAULT_PAGE));
    const limit = Math.max(1, Number(searchParams.get('limit')) || Number(DEFAULT_FEED_LIMIT));
    const offset = (page - 1) * limit;

    // Get total count for pagination
    const [totalRows] = await db.executeQuery(`
  SELECT COUNT(*) AS total
  FROM comments c
  WHERE 
    (
      (c.parent_permlink SIMILAR TO 'snap-container-%' AND c.json_metadata @> '{${TAG_FILTER}}')
      OR c.parent_permlink LIKE '${PARENT_PERMLINK}'
    )
    AND c.deleted = false
`);

    const total = parseInt(totalRows[0].total);

    // Get paginated data
    const [rows, headers] = await db.executeQuery(`
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
        WHERE 
            (
              (c.parent_permlink SIMILAR TO 'snap-container-%' AND c.json_metadata @> '{${TAG_FILTER}}')
              OR c.parent_permlink LIKE '${PARENT_PERMLINK}'
            )
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
        LIMIT ${limit}
        OFFSET ${offset};`
    );

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
      {
        status: 200,
        headers: {
          'Cache-Control': 's-maxage=300, stale-while-revalidate=150'
        }
      }
    );
  } catch (pgError) {
    const err = pgError as Error;
    console.warn('Postgres failed, trying SQL Server fallback...', err);
    try {
      const hivesqlDb = new HiveSQL_Database();
      const [rows, headers] = await hivesqlDb.executeQuery(`
        SELECT
  c.ID,
  c.author,
  c.permlink,
  c.parent_author,
  c.parent_permlink,
  c.title,
  c.body,
  c.json_metadata,
  c.created,
  c.last_payout,
  c.category,
  c.total_payout_value,
  c.curator_payout_value,
  c.author_rewards,
  c.pending_payout_value,
  c.total_pending_payout_value,
  c.net_votes,
  c.max_accepted_payout,
  c.percent_hbd,
  c.allow_votes,
  c.allow_curation_rewards,
  c.beneficiaries,
  c.url,
  -- Aggregate votes as JSON string
  (
    SELECT 
      STRING_AGG(
        CONCAT(
          '{"voter":"', v.voter,
          '","weight":', v.weight,
          ',"timestamp":"', FORMAT(v.[timestamp], 'yyyy-MM-ddTHH:mm:ss'),
          '","tx_id":', v.tx_id, '}'
        ), ','
      )
    FROM DBHive.dbo.TxVotes v
    WHERE v.author = c.author AND v.permlink = c.permlink
  ) AS votes_json
FROM DBHive.dbo.Comments c
WHERE c.parent_permlink LIKE 'snap-container-%'
ORDER BY c.created DESC
OFFSET 0 ROWS FETCH NEXT 25 ROWS ONLY;

`);
    } catch (sqlError) {
      console.error('Fallback SQL Server failed too', sqlError);
      return NextResponse.json({ success: false, error: 'All DBs failed' }, { status: 500 });
    }
  }

  // return NextResponse.json(
  //   {
  //     success: false,
  //     code: 'Failed to fetch data',
  //     error: err.message,
  //     // error: {
  //     //   name: err.name,
  //     //   message: err.message,
  //     //   // stack: err.stack,
  //     // }
  //   },
  //   { status: 500 }
  // );
  // }
}