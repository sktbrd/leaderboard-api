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

    return NextResponse.json(
      {
        success: true,
        data: rows[0],
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