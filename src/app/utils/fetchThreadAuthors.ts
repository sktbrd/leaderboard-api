import HiveClient, { logWithColor, fetchAccountInfo } from '@/app/utils/hiveClient';
import { Comment, ExtendedAccount } from '@hiveio/dhive';

export const fetchThreadAuthors = async (author: string, permlink: string): Promise<{ author: string, accountInfo: ExtendedAccount | null }[]> => {
    if (!author || !permlink) {
        logWithColor(`\x1b[32mInvalid parameters for fetchThreadAuthors: ${JSON.stringify({ author, permlink })}\x1b[0m`, 'green');
        return [];
    }

    const authors: string[] = [];
    let iteration = 0;

    while (iteration < 10) {
        logWithColor(`\x1b[32mFetching thread replies for ${author}/${permlink}, iteration ${iteration + 1}\x1b[0m`, 'green');
        try {
            const comments: Comment[] = await HiveClient.database.call('get_content_replies', [author, permlink]);

            if (!comments || comments.length === 0) {
                logWithColor('\x1b[32mNo more comments found. Exiting.\x1b[0m', 'green');
                break;
            }

            authors.push(...comments.map(comment => comment.author));
            iteration++;
            if (comments.length < 100) break;
        } catch (error) {
            logWithColor(`\x1b[31mError fetching thread replies for ${author}/${permlink}, iteration ${iteration + 1}: ${error}\x1b[0m`, 'red');
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
