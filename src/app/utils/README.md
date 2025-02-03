# Utility Functions

This folder contains utility functions for interacting with the Hive and Ethereum blockchains and the Supabase database. Below is an updated overview of the files and their functions with the folder structure.

## Folder Structure

```
src/app/utils/
├── README.md              # This file
├── dataManager.ts         # Manages data fetching, processing, and upserting into Supabase  
├── types.ts               # Defines TypeScript types used in the application
├── supabase/
│   ├── supabaseClient.ts  # Initializes the Supabase client
│   └── getLeaderboard.ts  # Fetches leaderboard data from Supabase
├── hive/
│   ├── hiveUtils.ts       # Helper functions for Hive operations (account fetch, metadata sanitation, conversion functions, logging)
│   └── fetchSubscribers.ts# Fetches subscribers from a Hive community using the Hive API
└── ethereum/
    ├── tokenAbi.ts        # Contains the ABI for Ethereum tokens (Gnars, Skatehive NFT, etc.)
    ├── ethereumUtils.ts   # Functions to read Gnars balance, Gnars votes, and Skatehive NFT balance from Ethereum blockchain
    └── giveth.ts          # Uses GraphQL to fetch donation records from the Giveth API
```

## File Details and Functions

- **dataManager.ts**  
  Contains functions to:
  - Upsert author data and account details into Supabase.
  - Fetch subscribers and process data in batches.
  - Calculate and update user points based on various multipliers and penalties.

- **types.ts**  
  Defines interfaces such as:
  - `DataBaseAuthor` – Represents an author’s various balances and account properties.
  - `FetchSubscribersResponse` – Represents the structure of the subscriber response.

- **supabase/supabaseClient.ts**  
  Initializes the Supabase client with the required URL and anon key from environment variables.

- **supabase/getLeaderboard.ts**  
  Contains a function to fetch and return leaderboard data from the Supabase database.

- **hive/hiveUtils.ts**  
  Presents helper functions for Hive, including:
  - `fetchAccountInfo` to retrieve account details.
  - `sanitizeJsonMetadata` and `extractEthAddressFromHiveAccount` for processing account metadata.
  - `convertVestingSharesToHivePower` and `calculateUserVoteValue` for balance conversion and vote value calculation.

- **hive/fetchSubscribers.ts**  
  Implements a function to iteratively fetch subscribers from a Hive community with pagination.

- **ethereum/tokenAbi.ts**  
  Contains the Ethereum token ABI (currently empty/placeholder).

- **ethereum/ethereumUtils.ts**  
  Provides functions to interact with Ethereum smart contracts:
  - `readGnarsBalance` – Gets the Gnars token balance.
  - `readGnarsVotes` – Retrieves Gnars voting information.
  - `readSkatehiveNFTBalance` – Fetches the Skatehive NFT balance.

- **ethereum/giveth.ts**  
  Contains a GraphQL query and a function `fetchGivethDonations` to fetch donation records from the Giveth API.

## Usage

These utilities are imported and used across the application to fetch, process, and store data seamlessly. Refer to individual files for more details on their functions and usage.