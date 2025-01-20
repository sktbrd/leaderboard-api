import { NextResponse } from 'next/server';
import { fetchAndStoreAllData } from '@/app/utils/dataManager';
import readline from 'readline';

const colors: { [key: string]: string } = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    purple: '\x1b[35m',
    orange: '\x1b[33m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m',
};

const logWithColor = (message: string, color: string) => {
    console.log(`${colors[color] || colors.reset}${message}${colors.reset}`);
};

const updateLoadingBar = (current: number, total: number) => {
    const barLength = 40;
    const progress = Math.round((current / total) * barLength);
    const bar = '█'.repeat(progress) + '-'.repeat(barLength - progress);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write(`Progress: [${bar}] ${((current / total) * 100).toFixed(2)}%`);
};

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { community } = body;

        logWithColor(`API called to fetch and store all data for community: ${community}`, 'cyan');

        if (!community) {
            logWithColor('Community parameter is missing', 'red');
            return NextResponse.json({ error: 'Community parameter is missing' }, { status: 400 });
        }

        await fetchAndStoreAllData(updateLoadingBar);

        logWithColor('Data fetched and stored successfully.', 'green');

        return NextResponse.json({ message: 'Data fetched and stored successfully.' }, { status: 200 });
    } catch (error: unknown) {
        logWithColor(`Error in API route: ${(error as Error).message}`, 'red');
        return NextResponse.json({ error: (error as Error).message || 'Unknown error' }, { status: 500 });
    } finally {
        logWithColor('API call completed.', 'blue');
    }
}
