import { ExtendedAccount } from '@hiveio/dhive';
import { supabase } from '@/app/utils/supabaseClient';
import { DataBaseAuthor } from './types';
import HiveClient from './hiveClient';

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
    console.log(`${colors[color] || colors.reset}${message}${colors.reset}`);
};

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

// Helper function to fetch account information
export const fetchAccountInfo = async (username: string): Promise<ExtendedAccount | null> => {
    try {
        const accounts = await HiveClient.database.call('get_accounts', [[username]]);
        if (accounts && accounts.length > 0) {
            return accounts[0];
        } else {
            logWithColor(`No account information found for ${username}`, 'red');
            return null;
        }
    } catch (error) {
        logWithColor(`Error fetching account information for ${username}: ${error}`, 'red');
        throw error; // Re-throw the error to ensure it is logged
    }
};

// Helper function to extract eth_address from json_metadata
export const extractEthAddress = (json_metadata: string): string => {
    if (!json_metadata) {
        return '0x0000000000000000000000000000000000000000';
    }

    try {
        const metadata = JSON.parse(json_metadata);
        return metadata.extensions?.eth_address || '0x0000000000000000000000000000000000000000';
    } catch (error) {
        logWithColor(`Error parsing json_metadata: ${error}`, 'red');
        return '0x0000000000000000000000000000000000000000';
    }
};
