import { NextResponse } from 'next/server';
import { HAFSQL_Database } from '@/lib/database';

const db = new HAFSQL_Database();

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    // Wait for params to be available
    const { username } = await params;

    // Get account information
    const [rows, headers] = await db.executeQuery(`
      SELECT 
        a.name,
        a.reputation,
        a.json_metadata,
        a.posting_metadata,
        a.followers,
        a.followings,
        a.created_at,
        a.last_vote_time,
        a.last_root_post,
        a.last_post,
        a.total_posts,
        a.incoming_hp,
        a.outgoing_hp,
        a.creator,
        a.reward_hive_balance,
        a.reward_hbd_balance,
        a.reward_vests_balance,
        a.reward_vests_balance_hp,
        a.vesting_withdraw_rate,
        a.proxy,
        a.last_update
      FROM accounts a
      WHERE a.name = '${username}'
    `);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Account not found'
        },
        { status: 404 }
      );
    }

    // Get following? information
    const [rowsFollowing, headersFollowing] = await db.executeQuery(`
SELECT Count(f.following_name) 
FROM follows f
JOIN community_subs cs ON f.following_name = cs.account_name 
WHERE 
f.follower_name = '${username}' AND
cs.community_name = 'hive-173115';
          `);

    // Get followers? information
    const [rowsFollowers, headersFollowers] = await db.executeQuery(`
SELECT Count(f.follower_name) 
FROM follows f
JOIN community_subs cs ON f.follower_name = cs.account_name 
WHERE 
f.following_name = '${username}' AND
cs.community_name = 'hive-173115';
      `);

    return NextResponse.json(
      {
        success: true,
        data: {
          ...rows[0],
          community_followers: rowsFollowers[0].count,
          community_followings: rowsFollowing[0].count,
        },
        headers: headers
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch account data'
      },
      { status: 500 }
    );
  }
}