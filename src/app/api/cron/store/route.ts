import { NextResponse } from 'next/server';
import { fetchAndStoreAllData } from '@/app/api/cron/dataManager';
import { logWithColor } from '@/app/utils/hive/hiveUtils';

export async function GET(request: Request) {
    try {
        // Get community from URL parameters if needed
        const { searchParams } = new URL(request.url);
        const community = searchParams.get('community');
        
        logWithColor(`API called to fetch leaderboard data${community ? ` for community: ${community}` : ''}`, 'cyan');
        
        logWithColor('Starting data fetch and store process...', 'purple');
        await fetchAndStoreAllData();
        logWithColor('Data fetch and store process completed.', 'purple');

        logWithColor('Data fetched and stored successfully.', 'green');

        return NextResponse.json({ message: 'Data fetched and stored successfully.' }, { status: 200 });
    } catch (error: unknown) {
        logWithColor(`Error in API route: ${(error as Error).message}`, 'red');
        return NextResponse.json({ error: (error as Error).message || 'Unknown error' }, { status: 500 });
    } finally {
        logWithColor('API call completed.', 'blue');
    }
}

// export async function POST(request: Request) {
//     try {
//         const body = await request.json();
//         const { community } = body;

//         logWithColor(`API called to fetch and store all data for community: ${community}`, 'cyan');

//         if (!community) {
//             logWithColor('Community parameter is missing', 'red');
//             return NextResponse.json({ error: 'Community parameter is missing' }, { status: 400 });
//         }

//         logWithColor('Starting data fetch and store process...', 'purple');
//         await fetchAndStoreAllData();
//         logWithColor('Data fetch and store process completed.', 'purple');

//         logWithColor('Data fetched and stored successfully.', 'green');

//         return NextResponse.json({ message: 'Data fetched and stored successfully.' }, { status: 200 });
//     } catch (error: unknown) {
//         logWithColor(`Error in API route: ${(error as Error).message}`, 'red');
//         return NextResponse.json({ error: (error as Error).message || 'Unknown error' }, { status: 500 });
//     } finally {
//         logWithColor('API call completed.', 'blue');
//     }
// }
