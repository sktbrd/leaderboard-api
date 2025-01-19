import { NextResponse } from 'next/server';
import { getDatabaseData } from '@/app/utils/databaseHelpers';

export async function GET() {
    try {
        const data = await getDatabaseData();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
