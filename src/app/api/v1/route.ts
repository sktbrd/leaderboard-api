import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json(
        {
            success: true,
            message: "Welcome to the API v1",
            endpoints: {
                leaderboard:    "/api/v1/leaderboard",
                feed_main:      "/api/v1/feed",
                feed_trending:  "/api/v1/feed/trending",
                feed_following: "/api/v1/feed/[username]/following",
                feed_user:      "/api/v1/feed/[username]",
                followers:      "/api/v1/followers",
                following:      "/api/v1/following",
                market:         "/api/v1/market",
                balance:        "/api/v1/balance",
                rewards:        "/api/v1/balance/[username]/rewards",
                vote:           "/api/v1/vote",
            }
        },
        { status: 200 }
    );
}
