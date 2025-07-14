import { NextRequest, NextResponse } from 'next/server';
import { HAFSQL_Database } from '@/lib/hafsql_database';

const db = new HAFSQL_Database();

export async function GET(
    request: NextRequest,
) {
    try {
        // Wait for params to be available
        const pathname = request.url; // e.g., "/api/v1/proffollowing/vaipraonde"
        const parts = pathname.split('/');
        const username = parts[parts.length - 1];

        // Get account information
        const [rows, headers] = await db.executeQuery(`
SELECT
cs.account_name, cs.community_name, 
f.follower_name, f.following_name
FROM follows f
JOIN community_subs cs ON f.following_name = cs.account_name 
WHERE 
f.follower_name = '${username}' AND
cs.community_name = 'hive-173115';
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
                total_count: rows.length,
                data: rows,
                headers: headers
            },
            {
                status: 200,
                headers: {
                    'Cache-Control': 's-maxage=300, stale-while-revalidate=150'
                }
            }
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