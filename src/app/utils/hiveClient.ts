import { Client, ExtendedAccount } from '@hiveio/dhive';
import { fetchSubscribers } from '@/app/utils/fetchSubscribers';
import { logWithColor, upsertAuthors, upsertAccountData, fetchAccountInfo, extractEthAddress } from './hiveHelpers';

const HiveClient = new Client('https://api.deathwing.me');
export default HiveClient;

export const fetchAndStoreAllData = async (): Promise<void> => {
    const community = process.env.NEXT_PUBLIC_HIVE_COMMUNITY_TAG || 'hive-173115';

    try {
        logWithColor('Starting to fetch and store all data...', 'blue');

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
                    const accountData = {
                        hive_author: accountInfo.name,
                        hive_balance: parseFloat(accountInfo.balance as string),
                        hp_balance: parseFloat(accountInfo.vesting_shares as string),
                        hbd_balance: parseFloat(accountInfo.hbd_balance as string),
                        hbd_savings_balance: parseFloat(accountInfo.savings_hbd_balance as string),
                        has_voted_in_witness: accountInfo.witness_votes.includes('skatehive'),
                        eth_address: extractEthAddress(accountInfo.json_metadata),
                    };
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
    }
};

