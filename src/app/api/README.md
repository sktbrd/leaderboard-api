# API Routes

This folder contains the API routes for the Skatehive Leaderboard application. Each route is responsible for fetching and updating data from various sources.

## Routes

- `cron/update/route.ts`: Executes a cron job to fetch and store partial data from the Hive blockchain.
- `ethHelpers/route.ts`: Provides endpoints to fetch Ethereum-related data such as Gnars balance, votes, and Skatehive NFT balance.
- `leaderboard/route.ts`: Fetches and stores all data for the leaderboard.
- `skatehive/route.ts`: Fetches data from the Supabase database.

> https://api.skatehive.app/api/skatehive lead you to the JSON response of skatehive members data

## Usage

Each route can be accessed via HTTP requests. Refer to the individual route files for more details on the request and response formats.