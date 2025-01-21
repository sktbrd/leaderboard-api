import { ExtendedAccount } from '@hiveio/dhive';
import HiveClient from './dataManager';
import { logWithColor } from './hiveHelpers';

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
    const result = await response.json();

    if (!result.result || !result.result.total_vesting_fund_hive || !result.result.total_vesting_shares) {
        logWithColor(`Invalid response from Hive API: ${JSON.stringify(result)}`, 'red');
        throw new Error('Invalid response from Hive API');
    }

    const vestHive =
        (parseFloat(result.result.total_vesting_fund_hive) * availableVESTS) /
        parseFloat(result.result.total_vesting_shares);

    const DelegatedToSomeoneHivePower =
        (parseFloat(result.result.total_vesting_fund_hive) * delegatedVestingSharesFloat) /
        parseFloat(result.result.total_vesting_shares);

    const delegatedToUserInUSD = (parseFloat(result.result.total_vesting_fund_hive) * receivedVestingSharesFloat) /
        parseFloat(result.result.total_vesting_shares);
    const HPdelegatedToUser = (parseFloat(result.result.total_vesting_fund_hive) * receivedVestingSharesFloat) /
        parseFloat(result.result.total_vesting_shares);

    return {
        hivePower: vestHive.toFixed(4),
        DelegatedToSomeoneHivePower: DelegatedToSomeoneHivePower.toFixed(4),
        delegatedToUserInUSD: delegatedToUserInUSD.toFixed(4),
        HPdelegatedToUser: HPdelegatedToUser.toFixed(4),
    };
};

export async function calculateUserVoteValue(user: ExtendedAccount) {
    const { voting_power = 0, vesting_shares = 0, received_vesting_shares = 0, delegated_vesting_shares = 0 } =
        user || {};

    const client = HiveClient;
    const reward_fund = await client.database.call('get_reward_fund', ['post']);
    const feed_history = await client.database.call('get_feed_history', []);

    const { reward_balance, recent_claims } = reward_fund;
    const { base, quote } = feed_history.current_median_history;

    const baseNumeric = parseFloat(base.split(' ')[0]);
    const quoteNumeric = parseFloat(quote.split(' ')[0]);

    const hbdMedianPrice = baseNumeric / quoteNumeric;

    const rewardBalanceNumeric = parseFloat(reward_balance.split(' ')[0]);
    const recentClaimsNumeric = parseFloat(recent_claims);

    const vestingSharesNumeric = parseFloat(String(vesting_shares).split(' ')[0]);
    const receivedVestingSharesNumeric = parseFloat(String(received_vesting_shares).split(' ')[0]);
    const delegatedVestingSharesNumeric = parseFloat(String(delegated_vesting_shares).split(' ')[0]);

    const total_vests = vestingSharesNumeric + receivedVestingSharesNumeric - delegatedVestingSharesNumeric;
    const final_vest = total_vests * 1e6;

    const power = (voting_power * 10000 / 10000) / 50;
    const rshares = power * final_vest / 10000;

    const estimate = rshares / recentClaimsNumeric * rewardBalanceNumeric * hbdMedianPrice;
    return estimate;
}
