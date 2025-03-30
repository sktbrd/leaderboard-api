import { NextResponse } from 'next/server';
import { HAFSQL_Database } from '@/lib/database';

const db = new HAFSQL_Database();

export async function GET(
    request: Request,
    { params }: { params: { username: string } }
) {
    try {
        // Wait for params to be available
        const { username } = await params;

        // Get account information
        const [rows, headers] = await db.executeQuery(`
        select following_name from follows where follower_name = '${username}';
    `);

        if (!rows || rows.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Account not found'
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: rows,
                headers: headers
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Profile fetch error:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch account data'
            },
            { status: 500 }
        );
    }
}