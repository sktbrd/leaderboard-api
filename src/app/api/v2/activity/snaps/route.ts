import { NextResponse } from 'next/server';
import { HAFSQL_Database } from '@/lib/database';

const db = new HAFSQL_Database();

const DEFAULT_PAGE = Number(process.env.DEFAULT_PAGE) || 1;
const DEFAULT_LIMIT = 2000;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const COMMUNITY = searchParams.get('community_code') || 'hive-173115';
    const page = Math.max(1, Number(searchParams.get('page')) || DEFAULT_PAGE);
    const limit = Math.max(1, Number(searchParams.get('limit')) || DEFAULT_LIMIT);
    const offset = (page - 1) * limit;
    const TAG_FILTER = `"tags": ["${COMMUNITY}"]`;

    // Step 1: Count distinct authors who snap this week
    const [countRows] = await db.executeQuery(`
      SELECT COUNT(*) AS total FROM (
        SELECT c.author
        FROM comments c
        WHERE c.author IN (
          SELECT account_name FROM hafsql.community_subs WHERE community_name = '${COMMUNITY}'
        )
        AND c.deleted = false
        AND parent_permlink SIMILAR TO 'snap-container-%'
        AND c.json_metadata @> '{${TAG_FILTER}}'
        AND c.created >= date_trunc('week', NOW())
        AND c.created < date_trunc('week', NOW()) + interval '7 days'
        GROUP BY c.author
      ) AS sub
    `);
    const total = parseInt(countRows[0].total);

    // Step 2: Get snap count per user for this week
    const [rows, headers] = await db.executeQuery(`
      SELECT 
        c.author AS user,
        COUNT(*) AS snaps,
        COALESCE(SUM((
          SELECT COUNT(*) 
          FROM operation_effective_comment_vote_view v 
          WHERE v.author = c.author 
          AND v.permlink = c.permlink
        )), 0) AS total_votes
      FROM comments c
      WHERE c.author IN (
        SELECT account_name FROM hafsql.community_subs WHERE community_name = '${COMMUNITY}'
      )
      AND c.deleted = false
      AND c.parent_permlink SIMILAR TO 'snap-container-%'
      AND c.json_metadata @> '{${TAG_FILTER}}'
      AND c.created >= date_trunc('week', NOW())
      AND c.created < date_trunc('week', NOW()) + interval '7 days'
      GROUP BY c.author
      ORDER BY snaps DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `);

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
    console.error('Community Snaps activity fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch community Snaps activity' },
      { status: 500 }
    );
  }
}
