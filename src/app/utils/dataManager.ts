import { Asset, Client } from '@hiveio/dhive';
import { supabase } from './supabaseClient'; // Use the existing Supabase client
import { logWithColor, fetchAccountInfo, extractEthAddress } from './hiveHelpers';
import { DataBaseAuthor } from './types';
import { convertVestingSharesToHivePower, calculateUserVoteValue } from './convertVeststoHP';
import { fetchSubscribers } from './fetchSubscribers';
import { readGnarsBalance, readGnarsVotes, readSkatehiveNFTBalance } from './ethHelpers';

const HiveClient = new Client('https://api.deathwing.me');
export default HiveClient;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
                logWithColor(`Successfully upserted account data for ${account.hive_author}.`, 'green');
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

export const fetchAndStoreAllData = async (): Promise<void> => {
    const startTime = Date.now(); // Start time
    const community = 'hive-173115';
    const batchSize = 25; // Reduce the batch size to process smaller batches

    try {
        logWithColor('Starting to fetch and store all data...', 'blue');

        // Fetch subscribers
        const subscribers = await fetchSubscribers(community);
        logWithColor(`Fetched ${subscribers.length} subscribers.`, 'blue');

        // Upsert authors in batches
        const totalBatches = Math.ceil(subscribers.length / batchSize);
        for (let i = 0; i < totalBatches; i++) {
            const batch = subscribers.slice(i * batchSize, (i + 1) * batchSize);

            // Process the current batch concurrently
            await Promise.all(batch.map(async (subscriber) => {
                await fetchAndUpsertAccountData(subscriber);
                await delay(200); // Increase delay to limit API calls to less than 50 per second
            }));

            logWithColor(`Processed batch ${i + 1} of ${totalBatches}.`, 'cyan');
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
export const fetchAndUpsertAccountData = async (subscriber: { hive_author: string }) => {
    const { hive_author } = subscriber;

    try {
        const accountInfo = await fetchAccountInfo(hive_author);
        if (!accountInfo) {
            logWithColor(`No account info found for ${hive_author}.`, 'red');
            return;
        }

        const vestingShares = parseFloat((accountInfo.vesting_shares as Asset).toString().split(" ")[0]);
        const delegatedVestingShares = parseFloat((accountInfo.delegated_vesting_shares as Asset).toString().split(" ")[0]);
        const receivedVestingShares = parseFloat((accountInfo.received_vesting_shares as Asset).toString().split(" ")[0]);

        const hp_balance = await convertVestingSharesToHivePower(
            vestingShares.toString(),
            delegatedVestingShares.toString(),
            receivedVestingShares.toString()
        );

        const voting_value = await calculateUserVoteValue(accountInfo);
        let gnars_balance = 0;
        let gnars_votes = 0;
        let skatehive_nft_balance = 0;
        const eth_address = extractEthAddress(accountInfo.json_metadata);
        if (eth_address === '0x0000000000000000000000000000000000000000') {
            logWithColor(`Skipping ${hive_author} (no ETH address).`, 'orange');
        }
        else {
            gnars_balance = await readGnarsBalance(eth_address);
            gnars_votes = await readGnarsVotes(eth_address);
            skatehive_nft_balance = await readSkatehiveNFTBalance(eth_address);
        }

        const accountData = {
            hive_author: accountInfo.name,
            hive_balance: parseFloat((accountInfo.balance as Asset).toString().split(" ")[0]),
            hp_balance: parseFloat(hp_balance.hivePower), // Use the calculated HP balance
            hbd_balance: parseFloat((accountInfo.hbd_balance as Asset).toString().split(" ")[0]),
            hbd_savings_balance: parseFloat((accountInfo.savings_hbd_balance as Asset).toString().split(" ")[0]),
            has_voted_in_witness: accountInfo.witness_votes.includes('skatehive'),
            eth_address,
            gnars_balance: gnars_balance ? parseFloat(gnars_balance.toString()) : 0,
            gnars_votes: gnars_votes ? parseFloat(gnars_votes.toString()) : 0,
            skatehive_nft_balance: skatehive_nft_balance ? parseFloat(skatehive_nft_balance.toString()) : 0,
            max_voting_power_usd: parseFloat(voting_value.toFixed(4)), // Use the calculated voting value
            last_updated: new Date().toISOString(),
            last_post: accountInfo.last_post,
            post_count: accountInfo.post_count,
        };

        await upsertAccountData([accountData]);
        logWithColor(`Successfully upserted data for ${hive_author}.`, 'green');
    } catch (error) {
        logWithColor(`Error fetching or upserting account info for ${hive_author}: ${error}`, 'red');
    }
};