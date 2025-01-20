import { Asset, Client } from '@hiveio/dhive';
import { supabase } from './supabaseClient'; // Use the existing Supabase client
import { logWithColor, fetchAccountInfo, extractEthAddress } from './hiveHelpers';
import { DataBaseAuthor } from './types';
import { convertVestingSharesToHivePower, calculateUserVoteValue } from './convertVeststoHP';
import { fetchSubscribers } from './fetchSubscribers';

const HiveClient = new Client('https://api.deathwing.me');
export default HiveClient;

// Helper function to upsert authors into Supabase
export const upsertAuthors = async (authors: { hive_author: string }[]) => {
    try {
        const authorData: DataBaseAuthor[] = authors.map(({ hive_author }) => ({
            hive_author,
        }));

        const { error } = await supabase
            .from('leaderboard')
            .upsert(authorData, { onConflict: 'hive_author' });

        if (error) {
            logWithColor(`Error upserting authors: ${error.message}`, 'red');
        } else {
            logWithColor(`Successfully upserted ${authors.length} authors.`, 'blue');
        }
    } catch (error) {
        logWithColor(`Error in upsertAuthors: ${error}`, 'red');
        throw error; // Re-throw the error to ensure it is logged
    }
};

// Helper function to upsert account data into the leaderboard
export const upsertAccountData = async (accounts: Partial<DataBaseAuthor>[]) => {
    try {
        for (const account of accounts) {
            const { error: upsertError } = await supabase
                .from('leaderboard')
                .upsert(account, { onConflict: 'hive_author' });

            if (upsertError) {
                logWithColor(`Error upserting account data for ${account.hive_author}: ${upsertError.message}`, 'red');
            } else {
                // logWithColor(`Successfully upserted account data for ${account.hive_author}.`, 'green');
            }
        }
    } catch (error) {
        logWithColor(`Error in upsertAccountData: ${error}`, 'red');
        throw error; // Re-throw the error to ensure it is logged
    }
};

export const getDatabaseData = async () => {
    try {
        const { data, error } = await supabase.from('leaderboard').select('*');
        if (error) {
            throw new Error(`Failed to fetch data: ${error.message}`);
        }
        return data;
    } catch (error) {
        logWithColor(`Error fetching data from the database: ${error}`, 'red');
        throw error;
    }
};

export const fetchAndStoreAllData = async (progressCallback?: (current: number, total: number) => void): Promise<void> => {
    const startTime = Date.now(); // Start time
    const community = 'hive-173115';
    try {
        logWithColor('Starting to fetch and store all data...', 'blue');

        // Fetch subscribers
        const subscribers = await fetchSubscribers(community);

        // dummy subscribers for testing 
        // const subscribers = [{ hive_author: 'xvlad' }];
        logWithColor(`Fetched ${subscribers.length} subscribers.`, 'blue');
        // Upsert authors
        await upsertAuthors(subscribers);
        logWithColor('Upserted authors.', 'blue');

        // Fetch and upsert account data for each subscriber
        for (let i = 0; i < subscribers.length; i++) {
            await fetchAndUpsertAccountData([subscribers[i]]);
            if (progressCallback) {
                progressCallback(i + 1, subscribers.length);
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

// Helper function to fetch and upsert account data for each subscriber
export const fetchAndUpsertAccountData = async (subscribers: { hive_author: string }[]) => {
    for (let i = 0; i < subscribers.length; i++) {
        const { hive_author } = subscribers[i];
        try {
            const accountInfo = await fetchAccountInfo(hive_author);
            if (accountInfo) {
                const vestingShares = parseFloat((accountInfo.vesting_shares as Asset).toString().split(" ")[0]);
                const delegatedVestingShares = parseFloat((accountInfo.delegated_vesting_shares as Asset).toString().split(" ")[0]);
                const receivedVestingShares = parseFloat((accountInfo.received_vesting_shares as Asset).toString().split(" ")[0]);

                const hp_balance = await convertVestingSharesToHivePower(vestingShares.toString(), delegatedVestingShares.toString(), receivedVestingShares.toString()); // Calculate HP

                const voting_value = await calculateUserVoteValue(accountInfo); // Calculate voting value



                const accountData = {
                    hive_author: accountInfo.name,
                    hive_balance: parseFloat((accountInfo.balance as Asset).toString().split(" ")[0]),
                    hp_balance: parseFloat(hp_balance.hivePower), // Use the calculated HP balance
                    hbd_balance: parseFloat((accountInfo.hbd_balance as Asset).toString().split(" ")[0]),
                    hbd_savings_balance: parseFloat((accountInfo.savings_hbd_balance as Asset).toString().split(" ")[0]),
                    has_voted_in_witness: accountInfo.witness_votes.includes('skatehive'),
                    eth_address: extractEthAddress(accountInfo.json_metadata),
                    max_voting_power_usd: parseFloat(voting_value.toFixed(4)), // Use the calculated voting value
                    last_updated: new Date().toISOString(),
                    last_post: accountInfo.last_post,
                    post_count: accountInfo.post_count,
                };
                await upsertAccountData([accountData]);
            }
        } catch (error) {
            logWithColor(`Error fetching or upserting account info for ${hive_author}: ${error}`, 'red');
        }
    }
};