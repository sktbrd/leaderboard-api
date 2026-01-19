import { Asset, DynamicGlobalProperties, ExtendedAccount } from '@hiveio/dhive';
import { Client } from '@hiveio/dhive';
import { Address } from 'viem';

// Hive RPC nodes with failover - dhive Client handles automatic failover
export const HIVE_RPC_NODES = [
    "https://api.deathwing.me",
    "https://api.hive.blog",
    "https://techcoderx.com",
    "https://anyx.io",
    "https://hive-api.arcange.eu",
    "https://hive-api.3speak.tv",
];

export const HiveClient = new Client(HIVE_RPC_NODES);

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
    const VERBOSE = true;

    if (VERBOSE)
        console.log(`${colors[color] || colors.reset}${message}${colors.reset}`);
};

// Helper function to fetch account information
export const fetchAccountInfo = async (username: string): Promise<ExtendedAccount | null> => {
    try {
        const accounts = await HiveClient.database.call('get_accounts', [[username]]);
        if (accounts && accounts.length > 0) {
            return accounts[0];
        } else {
            // logWithColor(`No account information found for ${username}`, 'red');
            return null;
        }
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

    const response = await fetch(HIVE_RPC_NODES[0], {
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
    const { voting_power = 0, vesting_shares = "0.000000 VESTS", received_vesting_shares = "0.000000 VESTS", delegated_vesting_shares = "0.000000 VESTS" } =
        user || {};

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