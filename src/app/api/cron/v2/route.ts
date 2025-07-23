import { matchAndUpsertDonors } from '@/app/utils/ethereum/giveth';
import { fetchSubscribers } from '@/app/utils/hive/fetchSubscribers';
import { logWithColor } from '@/app/utils/hive/hiveUtils';
import { getLeaderboard } from '@/app/utils/supabase/getLeaderboard';
import { NextResponse } from 'next/server';
import { fetchCommunityPosts } from '../../v2/activity/posts/route';
import { fetchCommunitySnaps } from '../../v2/activity/snaps/route';
import { calculateAndUpsertPoints, fetchAndUpsertAccountData } from './dataManager';

export async function GET() {
    try {
        await updateLeaderboardData();
        return NextResponse.json({ message: 'Cron job executed successfully.' });
    } catch (error) {
        console.error('Error executing cron job:', error);
        return NextResponse.json({ error: 'Failed to execute cron job.' }, { status: 500 });
    }
}

// Function to fetch and store data for a subset of subscribers
export const updateLeaderboardData = async () => {
    console.time("updateLeaderboardData");
    const batchSize = 25;
    const community = 'hive-173115';

    try {
        console.time("fetchSubscribers");
        const subscribers = await fetchSubscribers(community);
        console.warn(`${community} community has ${subscribers.length} subscribers.`);
        console.timeEnd("fetchSubscribers");

        console.time("getLeaderboard");
        const leaderboardData = await getLeaderboard();
        console.warn(`Leaderboard has ${leaderboardData.length} records.`);
        console.timeEnd("getLeaderboard");

        const postsData = await fetchCommunityPosts(community, 1, subscribers.length);
        const snapsData = await fetchCommunitySnaps(community, 1, subscribers.length);

        const validSubscribers = leaderboardData.filter(subscriber =>
            subscribers.some(data => data.hive_author === subscriber.hive_author)
        );

        const lastUpdatedData = validSubscribers
            .sort((a, b) => new Date(a.last_updated).getTime() - new Date(b.last_updated).getTime())
            .slice(0, 100);

        const totalBatches = Math.ceil(lastUpdatedData.length / batchSize);

        for (let i = 0; i < totalBatches; i++) {
            const batch = lastUpdatedData.slice(i * batchSize, (i + 1) * batchSize);

            await Promise.all(
                batch.map(async (subscriber) => {
                    console.log(`batch ${i}/${batchSize}) updating subscriber ${subscriber.hive_author}`);
                    try {
                        await fetchAndUpsertAccountData(subscriber, postsData, snapsData);
                    } catch (error) {
                        logWithColor(`Failed to process ${subscriber.hive_author}: ${error}`, 'red');
                    }
                })
            );

            logWithColor(`Processed batch ${i + 1} of ${totalBatches}.`, 'cyan');
        }

        console.time('Fetching and processing Giveth donations...');
        await matchAndUpsertDonors();
        console.timeEnd('Fetching and processing Giveth donations...');

        logWithColor('Calculating points for all users...', 'blue');
        await calculateAndUpsertPoints();

        logWithColor('All data fetched and stored successfully.', 'green');
    } catch (error) {
        logWithColor(`Error during data processing: ${error}`, 'red');
    }
    console.timeEnd("updateLeaderboardData");
};
