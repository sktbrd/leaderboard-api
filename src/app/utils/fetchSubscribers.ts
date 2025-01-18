import { FetchSubscribersResponse } from './types';
import { logWithColor, fetchAccountInfo } from './hiveClient';
import { supabase } from './supabaseClient';
import { ExtendedAccount } from '@hiveio/dhive';

export const fetchSubscribers = async (community: string, limit = 100): Promise<{ author: string, accountInfo: ExtendedAccount | null }[]> => {
    let lastAccount: string | null = null;
    const authors: string[] = [];

    while (true) {
        logWithColor(`Fetching subscribers with lastAccount: ${lastAccount || 'none'}`, 'purple');
        const response = await fetch('https://api.deathwing.me', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'bridge.list_subscribers',
                params: { community, limit, last: lastAccount || '' },
                id: 1,
            }),
        });

        if (!response.ok) {
            logWithColor(`Error fetching Hive API for subscribers: ${response.statusText}`, 'red');
            break;
        }

        const data: FetchSubscribersResponse = await response.json();
        if (!data.result || data.result.length === 0) {
            logWithColor('No more subscribers found. Exiting.', 'purple');
            break;
        }

        const batchAuthors = data.result.map(sub => sub[0]);

        for (const author of batchAuthors) {
            // Check if the author already exists in the leaderboard
            const { data: existingAuthor, error } = await supabase
                .from('leaderboard')
                .select('hive_author')
                .eq('hive_author', author)
                .single();

            if (error && error.code !== 'PGRST116') { // Ignore "no rows found" error
                logWithColor(`Error checking for existing author ${author}: ${error.message}`, 'red');
            } else if (existingAuthor) {
                logWithColor(`Author ${author} already exists in the leaderboard. Skipping upsert.`, 'green');
            } else {
                logWithColor(`Author ${author} does not exist. Adding to upsert queue.`, 'cyan');
                authors.push(author);
            }
        }

        lastAccount = data.result[data.result.length - 1][0];
        logWithColor(`Fetched ${data.result.length} subscribers in this batch.`, 'purple');

        if (data.result.length < limit) {
            logWithColor('Fetched fewer than the limit. Ending pagination.', 'purple');
            break;
        }
    }

    // Fetch account information for each author
    const authorsWithInfo = await Promise.all(authors.map(async (author) => {
        try {
            const accountInfo = await fetchAccountInfo(author);
            logWithColor(`Fetched account info for ${author}: ${JSON.stringify(accountInfo)}`, 'blue');
            return { author, accountInfo };
        } catch (error) {
            logWithColor(`Error fetching account info for ${author}: ${error}`, 'red');
            return { author, accountInfo: null };
        }
    }));

    return authorsWithInfo;
};
