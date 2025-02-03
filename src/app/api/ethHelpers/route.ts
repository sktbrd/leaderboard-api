import { NextRequest, NextResponse } from 'next/server';
import { readGnarsBalance, readGnarsVotes, readSkatehiveNFTBalance } from '@/app/utils/ethereum/ethereumUtils';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');
    const method = searchParams.get('method');

    if (!address) {
        return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    if (!method) {
        return NextResponse.json({ error: 'Method is required' }, { status: 400 });
    }

    try {
        let result;

        switch (method) {
            case 'balance':
                result = await readGnarsBalance(address);
                break;
            case 'votes':
                result = await readGnarsVotes(address);
                break;
            case 'skatehiveNFTBalance':
                result = await readSkatehiveNFTBalance(address);
                break;
            default:
                return NextResponse.json({ error: 'Invalid method' }, { status: 400 });
        }

        return NextResponse.json({ result }, { status: 200 });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            { error: 'Failed to fetch data', details: errorMessage },
            { status: 500 }
        );
    }
}
