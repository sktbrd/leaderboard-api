# Utility Functions

This folder contains utility functions for interacting with the Hive and Ethereum blockchains, and the Supabase database.

## Files

- `convertVeststoHP.ts`: Contains functions to convert vesting shares to Hive Power and calculate user vote value.
- `dataManager.ts`: Manages data fetching and upserting into the Supabase database.
- `databaseHelpers.ts`: Provides helper functions to interact with the Supabase database.
- `ethereumUtils.ts`: Contains functions to read Gnars balance, votes, and Skatehive NFT balance from the Ethereum blockchain.
- `fetchSubscribers.ts`: Fetches subscribers from the Hive blockchain Community.
- `hiveHelpers.ts`: Contains helper functions for interacting with the Hive blockchain.
- `supabaseClient.ts`: Initializes the Supabase client.
- `tokenAbi.ts`: Contains the ABI for Nouns Builder tokens like Gnars and Skatehive.
- `types.ts`: Defines TypeScript types used in the application. (can improve)

## Usage

These utility functions are used throughout the application to fetch, process, and store data. Refer to the individual files for more details on the functions and their usage.