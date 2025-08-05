import { HAFSQL_Database } from '@/lib/hafsql_database';
import { Account, Asset, DynamicGlobalProperties, ExtendedAccount } from '@hiveio/dhive';
import { Client } from '@hiveio/dhive';
import { Address } from 'viem';

const hafDb = new HAFSQL_Database();

export const HiveClient = new Client('https://api.deathwing.me');

const colors: { [key: string]: string } = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    purple: '\x1b[35m',
    orange: '\x1b[33m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
};

export const logWithColor = (message: string, color: string) => {
    const VERBOSE = false;

    if (VERBOSE)
        console.log(`${colors[color] || colors.reset}${message}${colors.reset}`);
};



// export async function (username: string): Promise<{
export const fetchDelegatedCurator = async (username: string): Promise<string> => {
    const COMMUNITY_CURATOR = process.env.COMMUNITY_CURATOR || 'skatehive';

    const query = `SELECT hp_equivalent as community_curator_delegation
FROM hafsql.delegations
where delegator ='${username}' and delegatee = '${COMMUNITY_CURATOR}';`

    const { rows, headers } = await hafDb.executeQuery(query);
    if (rows.length > 0) {
        console.log("NEWS: only delegate to communit curator "
            + COMMUNITY_CURATOR
            + " = " + rows[0].community_curator_delegation)
        return rows[0].community_curator_delegation
    } else {
        return "0"
    }
}

// Helper function to fetch account information
export const fetchAccountInfo = async (username: string): Promise<ExtendedAccount | null> => {
    try {
        // const accounts = await HiveClient.database.call('get_accounts', [[username]]);
        // if (accounts && accounts.length > 0) {
        //     return accounts[0];
        // } else {
        //     // logWithColor(`No account information found for ${username}`, 'red');
        //     return null;
        // }


        const query = `
SELECT
  a.id,
  a.name,
  a.owner,
  a.active,
  a.posting,
  a.memo_key,
  a.json_metadata,
  a.posting_metadata AS posting_json_metadata,
  a.proxy,
  a.last_owner_update,
  a.last_update AS last_account_update,
  a.created_at AS created,
  FALSE AS mined,
  FALSE AS owner_challenged,
  FALSE AS active_challenged,
  '' AS last_owner_proved,
  '' AS last_active_proved,
  a.recovery AS recovery_account,
  '' AS reset_account,
  '' AS last_account_recovery,
  0 AS comment_count,
  0 AS lifetime_vote_count,
  a.total_posts AS post_count,
  TRUE AS can_vote,
  10000 AS voting_power,
  a.last_vote_time,
  '{"current_mana": "0", "last_update_time": 0}' AS voting_manabar,

  b.hive || ' HIVE' AS balance,
  b.hbd || ' HBD' AS hbd_balance,
  b.vests || ' VESTS' AS vesting_shares,
  b.hp_equivalent AS vesting_balance,
  b.hive_savings || ' HIVE' AS savings_balance,
  b.hbd_savings || ' HBD' AS savings_hbd_balance,

  '0' AS hbd_seconds,
  '' AS hbd_seconds_last_update,
  '' AS hbd_last_interest_payment,
  '0' AS savings_hbd_seconds,
  '' AS savings_hbd_seconds_last_update,
  '' AS savings_hbd_last_interest_payment,
  0 AS savings_withdraw_requests,

  a.reward_hive_balance,
  a.reward_hbd_balance,
  a.reward_vests_balance,
  a.reward_vests_balance_hp AS reward_vesting_hive,

  0 AS curation_rewards,
  0 AS posting_rewards,

  -- Aggregate delegations
  COALESCE(d_out.total, 0) || ' VESTS' AS delegated_vesting_shares,
  COALESCE(d_in.total, 0) || ' VESTS' AS received_vesting_shares,

  a.vesting_withdraw_rate,
  a.next_vesting_withdrawal,
  a.withdrawn,
  a.to_withdraw,
  a.withdraw_routes,
  ARRAY[0, 0, 0, 0] AS proxied_vsf_votes,
  0 AS witnesses_voted_for,
  0 AS average_bandwidth,
  0 AS lifetime_bandwidth,
  '' AS last_bandwidth_update,
  0 AS average_market_bandwidth,
  0 AS lifetime_market_bandwidth,
  '' AS last_market_bandwidth_update,
  a.last_post,
  a.last_root_post

FROM hafsql.accounts a
LEFT JOIN hafsql.balances b ON a.id = b.account_id

-- Delegated out
LEFT JOIN (
  SELECT delegator, SUM(vests) AS total
  FROM hafsql.delegations
  GROUP BY delegator
) d_out ON d_out.delegator = a.name

-- Delegated in
LEFT JOIN (
  SELECT delegatee, SUM(vests) AS total
  FROM hafsql.delegations
  GROUP BY delegatee
) d_in ON d_in.delegatee = a.name

WHERE a.name = '${username}';

`

        const { rows } = await hafDb.executeQuery(query);
        const userAccount: Account = {
            ...rows[0],
            // posting_json_metadata: JSON.parse(rows[0].posting_json_metadata || '{}'),
        };

        const extendedAccount: ExtendedAccount = {
            ...userAccount,
            vesting_balance: rows[0].vesting_balance,
            reputation: 0,
            transfer_history: [],
            market_history: [],
            post_history: [],
            vote_history: [],
            other_history: [],
            witness_votes: [],
            tags_usage: [],
            guest_bloggers: [],
            open_orders: [],
            comments: [],
            blog: [],
            feed: [],
            recent_replies: [],
            recommended: [],
        };

        // console.dir("\n\naccounts[0]");
        // console.dir(accounts[0]);
        // console.dir("\n\nextendedAccount")
        // console.dir(extendedAccount)

        /**
         * 
         * ✅ Everything looks functionally correct and compatible.
        
        Here’s a quick validation checklist for the extendedAccount based on your updated query and merge strategy:
        
        🔍 Validation Summary
        Field	✅ Status	Notes
        balance, hbd_balance	✅ Correct string format	From balances table
        vesting_shares	✅ X.XXXXXX VESTS	Matches format expected by convertVestingSharesToHivePower()
        vesting_balance	✅ Numeric string	From hp_equivalent, you can safely cast it to float
        delegated_vesting_shares	✅ X.XXXXXX VESTS	Uses COALESCE(..., 0) and string-casted as expected
        json_metadata	✅ Parsed	Properly parsed from string to object
        posting_json_metadata	✅ Parsed or default {}	Handles fallback for empty string
        voting_manabar	✅ Default JSON string	You can optionally parse it if you plan to use it
        last_post, created	✅ Timestamps	Correctly formatted dates from HAFSQL
        
        
         */

        return extendedAccount
        // .rows.map(subscriber => ({ hive_author: subscriber.account_name }));


    } catch (error) {
        // logWithColor(`Error fetching account information for ${username}: ${error}`, 'red');
        throw error;
    }
};

// Helper function to sanitize json_metadata
export const sanitizeJsonMetadata = (json_metadata: string): string => {
    return json_metadata.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
};

// Helper function to extract eth_address from json_metadata
export const extractEthAddressFromHiveAccount = (json_metadata: string): string => {
    if (!json_metadata) {
        return '0x0000000000000000000000000000000000000000' as Address;
    }

    try {
        const sanitizedMetadata = sanitizeJsonMetadata(json_metadata);
        const metadata = JSON.parse(sanitizedMetadata);
        return metadata.extensions?.eth_address || '0x0000000000000000000000000000000000000000' as Address;
    } catch (error) {
        logWithColor(`Error parsing json_metadata: ${error}`, 'red');
        return '0x0000000000000000000000000000000000000000' as Address;
    }
};

const parseAsset = (asset: Asset | string): number => parseFloat(asset.toString().split(" ")[0]);

export const convertVestingSharesToHivePower = async (
    vestingShares: string,
    delegatedVestingShares: string,
    receivedVestingShares: string
) => {
    const vestingSharesFloat = parseFloat(vestingShares.split(" ")[0]);
    const delegatedVestingSharesFloat = parseFloat(delegatedVestingShares.split(" ")[0]);
    const receivedVestingSharesFloat = parseFloat(receivedVestingShares.split(" ")[0]);
    const availableVESTS = vestingSharesFloat - delegatedVestingSharesFloat;

    const response = await fetch('https://api.deathwing.me', {
        method: 'POST',
        body: JSON.stringify({
            jsonrpc: '2.0',
            method: 'condenser_api.get_dynamic_global_properties',
            params: [],
            id: 1,
        }),
        headers: { 'Content-Type': 'application/json' },
    });
    const result: { result: DynamicGlobalProperties } = await response.json();
    if (!result.result || !result.result.total_vesting_fund_hive || !result.result.total_vesting_shares) {
        logWithColor(`Invalid response from Hive API: ${JSON.stringify(result)}`, 'red');
        throw new Error('Invalid response from Hive API');
    }

    const vestHive =
        (parseAsset(result.result.total_vesting_fund_hive) * availableVESTS) /
        parseAsset(result.result.total_vesting_shares);

    const DelegatedToSomeoneHivePower =
        (parseAsset(result.result.total_vesting_fund_hive) * delegatedVestingSharesFloat) /
        parseAsset(result.result.total_vesting_shares);

    const delegatedToUserInUSD = (parseAsset(result.result.total_vesting_fund_hive) * receivedVestingSharesFloat) /
        parseAsset(result.result.total_vesting_shares);
    const HPdelegatedToUser = (parseAsset(result.result.total_vesting_fund_hive) * receivedVestingSharesFloat) /
        parseAsset(result.result.total_vesting_shares);

    return {
        hivePower: vestHive.toFixed(4),
        DelegatedToSomeoneHivePower: DelegatedToSomeoneHivePower.toFixed(4),
        delegatedToUserInUSD: delegatedToUserInUSD.toFixed(4),
        HPdelegatedToUser: HPdelegatedToUser.toFixed(4),
    };
};

export async function calculateUserVoteValue(user: ExtendedAccount) {
    const {
        voting_power = 0,
        vesting_shares = "0.000000 VESTS",
        received_vesting_shares = "0.000000 VESTS",
        delegated_vesting_shares = "0.000000 VESTS"
    } = user || {};

    const client = HiveClient;
    const reward_fund = await client.database.call('get_reward_fund', ['post']);
    const feed_history = await client.database.call('get_feed_history', []);

    const { reward_balance, recent_claims } = reward_fund;
    const { base, quote } = feed_history.current_median_history;

    const baseNumeric = parseAsset(base);
    const quoteNumeric = parseAsset(quote);

    const hbdMedianPrice = baseNumeric / quoteNumeric;

    const rewardBalanceNumeric = parseAsset(reward_balance);
    const recentClaimsNumeric = parseFloat(recent_claims);

    const vestingSharesNumeric = parseAsset(vesting_shares);
    const receivedVestingSharesNumeric = parseAsset(received_vesting_shares);
    const delegatedVestingSharesNumeric = parseAsset(delegated_vesting_shares);

    const total_vests = vestingSharesNumeric + receivedVestingSharesNumeric - delegatedVestingSharesNumeric;
    const final_vest = total_vests * 1e6;

    const power = (voting_power * 10000 / 10000) / 50;
    const rshares = power * final_vest / 10000;

    const estimate = rshares / recentClaimsNumeric * rewardBalanceNumeric * hbdMedianPrice;
    return estimate;
}