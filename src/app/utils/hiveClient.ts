import { Client, ExtendedAccount } from '@hiveio/dhive';
import { supabase } from '@/app/utils/supabaseClient';
import { fetchSubscribers } from '@/app/utils/fetchSubscribers';
import { fetchThreadAuthors } from '@/app/utils/fetchThreadAuthors';
// Remove the unused import 'fetchBlogAuthors'
// import { fetchBlogAuthors } from './fetchBlogAuthors';
import { Author } from './types';

const HiveClient = new Client('https://api.deathwing.me');
export default HiveClient;

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

export async function findPosts(query: string, params: unknown[]) {
    const by = 'get_discussions_by_' + query;
    const posts = await HiveClient.database.call(by, params);
    return posts;
}

// Helper function to fetch type IDs
const fetchTypeIds = async (types: string[]): Promise<{ [key: string]: number }> => {
    const { data, error } = await supabase
        .from('author_types')
        .select('id, type_name')
        .in('type_name', types);

    if (error) {
        logWithColor(`Error fetching type IDs: ${error.message}`, 'red');
        return {};
    }

    return data.reduce((map, type) => {
        map[type.type_name] = type.id;
        return map;
    }, {} as { [key: string]: number });
};

// Helper function to upsert authors into Supabase with their types
const upsertAuthorsWithTypes = async (authors: { hive_author: string; types: string[] }[]) => {
    try {
        // Step 1: Upsert authors into the leaderboard table
        const authorData: Author[] = authors.map(({ hive_author }) => ({
            hive_author,
            eth_address: '0x0000000000000000000000000000000000000000', // Default ETH address
        }));

        const { error: leaderboardError } = await supabase
            .from('leaderboard')
            .upsert(authorData, { onConflict: 'hive_author' });

        if (leaderboardError) {
            logWithColor(`Error upserting authors: ${leaderboardError.message}`, 'red');
            return;
        }

        // Step 2: Fetch type IDs for the given types
        const typeNames = [...new Set(authors.flatMap((a) => a.types))]; // Deduplicate types
        const typeMap = await fetchTypeIds(typeNames);

        // Step 3: Prepare data for leaderboard_author_types
        const associationData = authors.flatMap(({ hive_author, types }) =>
            types
                .map((type) => {
                    const typeId = typeMap[type];
                    if (!typeId) {
                        logWithColor(`Type "${type}" not found in typeMap`, 'red');
                        return null;
                    }
                    return { leaderboard_id: hive_author, type_id: typeId };
                })
                .filter((entry): entry is { leaderboard_id: string; type_id: number } => entry !== null)
        );

        // Step 4: Upsert into leaderboard_author_types
        const { error: associationError } = await supabase
            .from('leaderboard_author_types')
            .upsert(associationData, { onConflict: 'leaderboard_id,type_id' });

        if (associationError) {
            logWithColor(`Error associating authors with types: ${associationError.message}`, 'red');
        } else {
            logWithColor(`Successfully associated authors with types.`, 'blue');
        }
    } catch (error) {
        logWithColor(`Error in upsertAuthorsWithTypes: ${error}`, 'red');
    }
};

// Helper function to upsert account data into the leaderboard
const upsertAccountData = async (accounts: ExtendedAccount[]) => {
    try {
        const accountData = accounts.map(account => ({
            hive_author: account.name,
            hive_balance: parseFloat(account.balance as string),
            hp_balance: parseFloat(account.vesting_shares as string),
            hbd_balance: parseFloat(account.hbd_balance as string),
            hbd_savings_balance: parseFloat(account.savings_hbd_balance as string),
            has_voted_in_witness: account.witness_votes.length > 0,
        }));

        logWithColor(`Upserting account data: ${JSON.stringify(accountData)}`, 'blue');

        const { error: upsertError } = await supabase
            .from('leaderboard')
            .upsert(accountData, { onConflict: 'hive_author' });

        if (upsertError) {
            logWithColor(`Error upserting account data: ${upsertError.message}`, 'red');
        } else {
            logWithColor(`Successfully upserted account data for ${accounts.length} accounts.`, 'green');
        }
    } catch (error) {
        logWithColor(`Error in upsertAccountData: ${error}`, 'red');
    }
};

// Consolidated function
export const fetchAndStoreAllData = async (): Promise<void> => {
    const community = 'hive-173115';
    const mainFeedAuthor = process.env.NEXT_PUBLIC_MAINFEED_AUTHOR || '';
    const parentPermlink = process.env.NEXT_PUBLIC_PARENT_PERM || '';
    // Remove the unused variable 'tag'
    // const tag = process.env.NEXT_PUBLIC_HIVE_COMMUNITY_TAG || '';

    try {
        logWithColor('Starting to fetch and store all data...', 'blue');

        // Fetch authors by type
        const subscribers = await fetchSubscribers(community).then((authors) =>
            authors.map(({ author, accountInfo }) => ({ hive_author: author, types: ['subscriber'], account_info: accountInfo }))
        );

        const threadAuthors = mainFeedAuthor && parentPermlink
            ? await fetchThreadAuthors(mainFeedAuthor, parentPermlink).then((authors) =>
                authors.map(({ author, accountInfo }) => {
                    logWithColor(`Fetched account info for ${author}: ${JSON.stringify(accountInfo?.name)}`, 'teal');
                    return { hive_author: author, types: ['thread author'], account_info: accountInfo };
                })
            )
            : [];

        // Merge authors and their types
        const authorsByType = [...subscribers, ...threadAuthors];

        // Group by `hive_author` to merge types for the same author
        const mergedAuthors = Object.values(
            authorsByType.reduce((acc, { hive_author, types, account_info }) => {
                if (!acc[hive_author]) acc[hive_author] = { hive_author, types: new Set<string>(), account_info };
                types.forEach((type) => acc[hive_author].types.add(type));
                return acc;
            }, {} as { [key: string]: { hive_author: string; types: Set<string>; account_info: ExtendedAccount | null } })
        ).map(({ hive_author, types, account_info }) => ({
            hive_author,
            types: Array.from(types),
            account_info,
        }));

        // Upsert authors with their types
        await upsertAuthorsWithTypes(mergedAuthors);

        // Upsert account data
        const accounts = mergedAuthors.map(author => author.account_info).filter(account => account !== null) as ExtendedAccount[];
        await upsertAccountData(accounts);

        logWithColor('Finished fetching and storing all data.', 'green');
    } catch (error) {
        logWithColor(`Error in fetchAndStoreAllData: ${error}`, 'red');
    }
};

export const fetchAccountInfo = async (username: string) => {
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
        return null;
    }
};

