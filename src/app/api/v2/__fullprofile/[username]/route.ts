import { NextRequest, NextResponse } from 'next/server';
import { HAFSQL_Database } from '@/lib/hafsql_database';

const db = new HAFSQL_Database();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        // Wait for params to be available
        const { username } = await params;

        // Get account information
        const {rows, headers} = await db.executeQuery(`
     SELECT
    a.name,
    a.reputation,
    a.json_metadata,
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
    a.last_update,
    b.hive,
    b.hbd,
    b.vests,
    b.hp_equivalent,
    b.hive_savings,
    b.hbd_savings,
    c.total_pending_payout,
    c.pending_hbd,
    c.pending_hp,
    c.pending_posts_count,
    c.total_author_rewards,
    c.total_author_rewards_in_hive,
    c.total_curator_payouts,
    c.total_beneficiary_payouts
FROM accounts a
LEFT JOIN balances b ON a.name = b.account_name
LEFT JOIN (
    SELECT 
        author,
        SUM(pending_payout_value) AS total_pending_payout,
        SUM(CASE WHEN percent_hbd = 10000 THEN pending_payout_value ELSE 0 END) AS pending_hbd,
        SUM(CASE WHEN percent_hbd = 0 THEN pending_payout_value ELSE 0 END) AS pending_hp,
        COUNT(*) AS pending_posts_count,
        SUM(author_rewards) AS total_author_rewards,
        SUM(author_rewards_in_hive) AS total_author_rewards_in_hive,
        SUM(curator_payout_value) AS total_curator_payouts,
        SUM(beneficiary_payout_value) AS total_beneficiary_payouts
    FROM comments
    WHERE 
        author = '${username}' 
        AND cashout_time > NOW()
        AND pending_payout_value > 0
        AND deleted = false
    GROUP BY author
) c ON a.name = c.author
WHERE a.name = '${username}';
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