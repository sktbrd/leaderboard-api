import { logWithColor, findPosts } from '@/app/utils/hiveClient';
import { FetchBlogAuthorsResponse } from './types';

export const fetchBlogAuthors = async (tag: string, limit = 20): Promise<string[]> => {
    if (!tag) {
        logWithColor(`Invalid tag for fetchBlogAuthors: ${tag}`, 'orange');
        return [];
    }

    const authors: string[] = [];

    try {
        logWithColor(`Fetching blog posts for tag: ${tag}`, 'orange');
        const params = { tag, limit };
        logWithColor(`Params: ${JSON.stringify(params)}`, 'orange');
        const posts: FetchBlogAuthorsResponse = await findPosts('created', [params]);

        if (!posts.result || posts.result.length === 0) {
            logWithColor('No more blog posts found. Exiting.', 'orange');
            return authors;
        }

        authors.push(...posts.result.map(post => post.author));
    } catch (error) {
        logWithColor(`Error in fetchBlogAuthors: ${(error as Error).message}`, 'red');
        logWithColor(`Error details: ${JSON.stringify(error)}`, 'red');
    }

    return authors;
};



