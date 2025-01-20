import { NextResponse } from 'next/server';
import { getDatabaseData } from '@/app/utils/dataManager';

export async function GET() {
    try {
        const data = await getDatabaseData();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching data:', error);
        return NextResponse.json({ error: 'Failed to fetch data', details: (error as Error).message }, { status: 500 });
    }
}
