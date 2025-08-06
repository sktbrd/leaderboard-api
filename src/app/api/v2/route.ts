import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json(
        {
            success: true,
            message: "Welcome to the API v1",
            endpoints: {
                leaderboard:    "/api/v2/leaderboard",
                feed_main:      "/api/v2/feed",
                feed_trending:  "/api/v2/feed/trending",
                feed_following: "/api/v2/feed/[username]/following",
                feed_user:      "/api/v2/feed/[username]",
                followers:      "/api/v2/followers",
                following:      "/api/v2/following",
                market:         "/api/v2/market",
                balance:        "/api/v2/balance",
                rewards:        "/api/v2/balance/[username]/rewards",
                vote:           "/api/v2/vote",
            }
        },
        { status: 200 }
    );
}
