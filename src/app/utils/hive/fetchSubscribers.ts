import { logWithColor } from './hiveUtils';
import { HAFSQL_Database } from '@/lib/hafsql_database';

const hafDb = new HAFSQL_Database();
interface FetchSubscribersResponse {
    result: [string][];
}

export const fetchSubscribers = async (community: string, limit = 100): Promise<{ hive_author: string }[]> => {
    // let lastAccount: string | null = null;
    // const authors: string[] = [];

    // while (true) {
    //     logWithColor(`Fetching subscribers with lastAccount: ${lastAccount || 'none'}`, 'purple');
    //     const response: Response = await fetch('https://api.deathwing.me', {
    //         method: 'POST',
    //         headers: { 'Content-Type': 'application/json' },
    //         body: JSON.stringify({
    //             jsonrpc: '2.0',
    //             method: 'bridge.list_subscribers',
    //             params: { community, limit, last: lastAccount || '' },
    //             id: 1,
    //         }),
    //     });

    //     if (!response.ok) {
    //         logWithColor(`Error fetching Hive API for subscribers: ${response.text}`, 'red');
    //         throw new Error(`Error fetching Hive API for subscribers: ${response.statusText}`);
    //     }

    //     const data: FetchSubscribersResponse = await response.json();
    //     if (!data.result || data.result.length === 0) {
    //         logWithColor('No more subscribers found. Exiting.', 'purple');
    //         break;
    //     }

    //     const batchAuthors = data.result.map((sub: [string]) => sub[0]);
    //     authors.push(...batchAuthors);

    //     lastAccount = data.result[data.result.length - 1][0];
    //     logWithColor(`Fetched ${data.result.length} subscribers in this batch.`, 'blue');

    //     if (data.result.length < limit) {
    //         logWithColor('Fetched fewer than the limit. Ending pagination.', 'white');
    //         break;
    //     }
    // }

    // return authors.map(author => ({ hive_author: author }));


    const subscribers = await hafDb.executeQuery(
    `SELECT account_name FROM hafsql.community_subs WHERE community_name = '${community}'`
    );

    return subscribers.rows.map(subscriber => ({ hive_author: subscriber.account_name }));
};
