import { Client, Asset } from '@hiveio/dhive';
import { fetchSubscribers } from '@/app/utils/fetchSubscribers';
import { logWithColor, upsertAuthors, upsertAccountData, fetchAccountInfo, extractEthAddress } from './hiveHelpers';
import { convertVestingSharesToHivePower, calculateUserVoteValue } from './convertVeststoHP';
const HiveClient = new Client('https://api.deathwing.me');
export default HiveClient;

export const fetchAndStoreAllData = async (): Promise<void> => {
    const community = process.env.NEXT_PUBLIC_HIVE_COMMUNITY_TAG || 'hive-173115';
    const startTime = Date.now(); // Start time

    try {
        logWithColor('Starting to fetch and store all data...', 'blue');

        // dummy object for testing 
        // const subscribers = [{ hive_author: 'gnars' }]

        // Fetch subscribers
        const subscribers = await fetchSubscribers(community);
        logWithColor(`Fetched ${subscribers.length} subscribers.`, 'blue');

        // Upsert authors
        await upsertAuthors(subscribers);
        logWithColor('Upserted authors.', 'blue');

        // Fetch and upsert account data for each subscriber
        for (const { hive_author } of subscribers) {
            try {
                const accountInfo = await fetchAccountInfo(hive_author);
                if (accountInfo) {
                    const vestingShares = parseFloat((accountInfo.vesting_shares as Asset).toString().split(" ")[0]);
                    const delegatedVestingShares = parseFloat((accountInfo.delegated_vesting_shares as Asset).toString().split(" ")[0]);
                    const receivedVestingShares = parseFloat((accountInfo.received_vesting_shares as Asset).toString().split(" ")[0]);

                    logWithColor(`Vesting Shares: ${vestingShares}`, 'yellow');
                    logWithColor(`Delegated Vesting Shares: ${delegatedVestingShares}`, 'yellow');
                    logWithColor(`Received Vesting Shares: ${receivedVestingShares}`, 'yellow');

                    const hp_balance = await convertVestingSharesToHivePower(vestingShares.toString(), delegatedVestingShares.toString(), receivedVestingShares.toString()); // Calculate HP

                    logWithColor(`Calculated HP Balance: ${hp_balance.hivePower}`, 'yellow');

                    const voting_value = await calculateUserVoteValue(accountInfo); // Calculate voting value
                    logWithColor(`Calculated Voting Value: ${voting_value}`, 'yellow');

                    const accountData = {
                        hive_author: accountInfo.name,
                        hive_balance: parseFloat((accountInfo.balance as Asset).toString().split(" ")[0]),
                        hp_balance: parseFloat(hp_balance.hivePower), // Use the calculated HP balance
                        hbd_balance: parseFloat((accountInfo.hbd_balance as Asset).toString().split(" ")[0]),
                        hbd_savings_balance: parseFloat((accountInfo.savings_hbd_balance as Asset).toString().split(" ")[0]),
                        has_voted_in_witness: accountInfo.witness_votes.includes('skatehive'),
                        eth_address: extractEthAddress(accountInfo.json_metadata),
                        max_voting_power_usd: parseFloat(voting_value.toFixed(3)), // Use the calculated voting value
                    };
                    logWithColor(`Upserting Voting Value: ${accountData.max_voting_power_usd} for ${hive_author}`, 'yellow');
                    await upsertAccountData([accountData]);
                    logWithColor(`Upserted account data for ${hive_author}.`, 'blue');
                }
            } catch (error) {
                logWithColor(`Error fetching or upserting account info for ${hive_author}: ${error}`, 'red');
            }
        }

        logWithColor('Finished fetching and storing all data.', 'green');
    } catch (error) {
        logWithColor(`Error in fetchAndStoreAllData: ${error}`, 'red');
        throw error; // Re-throw the error to ensure it is logged
    } finally {
        const endTime = Date.now(); // End time
        const elapsedTime = (endTime - startTime) / 1000; // Calculate elapsed time in seconds
        logWithColor(`Elapsed time: ${elapsedTime} seconds`, 'purple');
    }
};

