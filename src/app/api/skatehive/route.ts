import { getLeaderboard } from '@/app/utils/supabase/getLeaderboard';
import { NextRequest, NextResponse } from 'next/server';


export async function GET() {
    try {
        const data = await getLeaderboard();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data', details: (error as Error).message }, { status: 500 });
    }
}
