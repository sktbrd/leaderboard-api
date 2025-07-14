import { NextResponse } from 'next/server';
// import { fetchAndStoreAllData } from '@/app/utils/dataManager';
import { getLeaderboard } from '@/app/utils/supabase/getLeaderboard';

export async function GET() {
    console.log("Fetching LEADERBOARD data...");
    try {
        const data = await getLeaderboard();
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 's-maxage=500, stale-while-revalidate=300'
            }
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data', details: (error as Error).message }, { status: 500 });
    }
}
