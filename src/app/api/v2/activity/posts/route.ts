import { NextResponse } from 'next/server';
import { HAFSQL_Database } from '@/lib/hafsql_database';

const db = new HAFSQL_Database();

const DEFAULT_PAGE = Number(process.env.DEFAULT_PAGE) || 1;
const DEFAULT_LIMIT = 2000;

// Define constantes para os multiplicadores do score
const MULTIPLIER_POSTS = 1.5;
const MULTIPLIER_VOTES = 0.2;
const MULTIPLIER_PAYOUT = 10;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const COMMUNITY = searchParams.get('community_code') || 'hive-173115';
    const page = Math.max(1, Number(searchParams.get('page')) || DEFAULT_PAGE);
    const limit = Math.max(1, Number(searchParams.get('limit')) || DEFAULT_LIMIT);
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        c.author AS user,
        COUNT(*) AS posts,
        COALESCE(SUM((
          SELECT COUNT(*) 
          FROM operation_effective_comment_vote_view v 
          WHERE v.author = c.author 
          AND v.permlink = c.permlink
        )), 0) AS total_votes,
        SUM(c.author_rewards_in_hive + c.pending_payout_value) AS total_payout,
        ROUND(
          (COUNT(*) * ${MULTIPLIER_POSTS}) 
          + (COALESCE(SUM((
              SELECT COUNT(*) 
              FROM operation_effective_comment_vote_view v 
              WHERE v.author = c.author 
              AND v.permlink = c.permlink
            )), 0) * ${MULTIPLIER_VOTES})
          + (SUM(c.author_rewards_in_hive + c.pending_payout_value) * ${MULTIPLIER_PAYOUT})
        ) AS score,
        TO_CHAR(NOW(), 'IYYY-IW') AS current_week
      FROM comments c
      WHERE c.author IN (
        SELECT account_name FROM hafsql.community_subs WHERE community_name = '${COMMUNITY}'
      )
      AND c.category = '${COMMUNITY}'
      AND c.deleted = false
      AND c.parent_author = ''
      AND c.created >= date_trunc('week', NOW())
      AND c.created < date_trunc('week', NOW()) + interval '7 days'
      GROUP BY c.author
      ORDER BY score DESC
      LIMIT ${limit}
      OFFSET ${offset};
    `;

    const [rows, headers] = await db.executeQuery(query);
    const total = rows.length;

    return NextResponse.json(
      {
        success: true,
        rows,
        headers,
        pagination: {
          total,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
          limit,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1,
          nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
          prevPage: page > 1 ? page - 1 : null,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Community Posts activity fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch community Posts activity' },
      { status: 500 }
    );
  }
}
