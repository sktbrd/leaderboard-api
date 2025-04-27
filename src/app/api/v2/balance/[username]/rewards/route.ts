import { NextRequest, NextResponse } from 'next/server';
import { HAFSQL_Database } from '@/lib/database';

const db = new HAFSQL_Database();

export async function GET(
    request: NextRequest,
) {
  console.log("Fetching BALANCEC REWARDS data...");
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    // Get pending rewards information with detailed payout calculations
    const [rows] = await db.executeQuery(`
      SELECT 
        SUM(CAST(pending_payout_value AS DOUBLE PRECISION)) as total_pending_payout,
        COALESCE(SUM(
          CASE 
            WHEN percent_hbd = 10000 THEN CAST(pending_payout_value AS DOUBLE PRECISION)
            ELSE 0 
          END
        ), 0) as pending_hbd,
        COALESCE(SUM(
          CASE 
            WHEN percent_hbd = 0 THEN CAST(pending_payout_value AS DOUBLE PRECISION)
            ELSE 0 
          END
        ), 0) as pending_hp,
        COUNT(*) as pending_posts_count,
        SUM(CAST(author_rewards AS DOUBLE PRECISION)) as total_author_rewards,
        SUM(CAST(author_rewards_in_hive AS DOUBLE PRECISION)) as total_author_rewards_in_hive,
        SUM(CAST(curator_payout_value AS DOUBLE PRECISION)) as total_curator_payouts,
        SUM(CAST(beneficiary_payout_value AS DOUBLE PRECISION)) as total_beneficiary_payouts
      FROM comments c
      WHERE c.author = '${username}'
      AND c.cashout_time > NOW()
      AND c.pending_payout_value > 0
      AND c.deleted = false
    `);

    // Get detailed list of pending posts
    const [pendingPosts] = await db.executeQuery(`
      SELECT 
        c.title,
        c.permlink,
        c.created,
        c.cashout_time,
        c.remaining_till_cashout,
        c.last_payout,
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
        c.allow_curation_rewards
      FROM comments c
      WHERE c.author = '${username}'
      AND c.pending_payout_value > 0
      AND c.cashout_time > NOW()
      AND c.deleted = false
      ORDER BY c.pending_payout_value DESC
    `);

    return NextResponse.json(
      {
        success: true,
        data: {
          summary: {
            total_pending_payout: Number(rows[0].total_pending_payout).toFixed(3),
            pending_hbd: Number(rows[0].pending_hbd).toFixed(3),
            pending_hp: Number(rows[0].pending_hp).toFixed(3),
            pending_posts_count: rows[0].pending_posts_count,
            total_author_rewards: Number(rows[0].total_author_rewards).toFixed(3),
            total_author_rewards_in_hive: Number(rows[0].total_author_rewards_in_hive).toFixed(3),
            total_curator_payouts: Number(rows[0].total_curator_payouts).toFixed(3),
            total_beneficiary_payouts: Number(rows[0].total_beneficiary_payouts).toFixed(3)
          },
          pending_posts: pendingPosts
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Rewards fetch error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch rewards data'
      },
      { status: 500 }
    );
  }
}