import { NextResponse } from 'next/server';
import { HAFSQL_Database } from '@/lib/hafsql_database';
import { fetchCommunityPosts } from '@/app/utils/hive/fetchCommunityPosts';

const db = new HAFSQL_Database();

const DEFAULT_PAGE = Number(process.env.DEFAULT_PAGE) || 1;
const DEFAULT_LIMIT = 2000;

// Define constantes para os multiplicadores do score
const MULTIPLIER_POSTS = 1.5;
const MULTIPLIER_VOTES = 0.2;
const MULTIPLIER_PAYOUT = 10;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const COMMUNITY = searchParams.get('community_code') || process.env.MY_COMMUNITY_CATEGORY || 'hive-173115';
        const page = Math.max(1, Number(searchParams.get('page')) || DEFAULT_PAGE);
        const limit = Math.max(1, Number(searchParams.get('limit')) || DEFAULT_LIMIT);

        const { rows, headers } = await fetchCommunityPosts(COMMUNITY, page, limit);
        const total = rows.length;

        return NextResponse.json(
            {
                success: true,
                rows,
                headers,
                pagination: {
                    total,
                    totalPages: Math.ceil(total / limit),
                    currentPage: page,
                    limit,
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPrevPage: page > 1,
                    nextPage: page < Math.ceil(total / limit) ? page + 1 : null,
                    prevPage: page > 1 ? page - 1 : null,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Community Posts activity fetch error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch community Posts activity' },
            { status: 500 }
        );
    }
}