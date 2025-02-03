# 🛹 Skatehive Leaderboard

Welcome to the Skatehive Leaderboard project! This application is designed to create a leaderboard for the Skatehive community, integrating data from Hive and Ethereum blockchains, and Supabase database.

## 📁 Project Structure

```
.
├── README.md
├── eslint.config.mjs
├── example.env
├── next-env.d.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── public
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src
│   ├── app
│   │   ├── api
│   │   │   ├── README.md
│   │   │   ├── cron
│   │   │   │   └── update
│   │   │   │       └── route.ts
│   │   │   ├── ethHelpers
│   │   │   │   └── route.ts
│   │   │   ├── leaderboard
│   │   │   │   └── route.ts
│   │   │   └── skatehive
│   │   │       └── route.ts
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.module.css
│   │   ├── page.tsx
│   │   └── utils
│   │       ├── README.md
│   │       ├── dataManager.ts
│   │       ├── ethereum
│   │       │   ├── ethereumUtils.ts
│   │       │   ├── giveth.ts
│   │       │   └── tokenAbi.ts
│   │       ├── hive
│   │       │   ├── fetchSubscribers.ts
│   │       │   └── hiveUtils.ts
│   │       ├── supabase
│   │       │   ├── getLeaderboard.ts
│   │       │   └── supabaseClient.ts
│   │       └── types.ts
│   └── models
├── tsconfig.json
└── vercel.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js
- pnpm (or npm/yarn)
- Supabase account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/skatehive-leaderboard.git
cd skatehive-leaderboard
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

Copy the `example.env` file to `.env` and fill in the required values.

```bash
cp example.env .env
```

### Running the Development Server

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Setting Up Supabase

1. Create a new project on [Supabase](https://supabase.com/).
2. Create a table named `leaderboard` with the following schema:

```sql
create table public.leaderboard (
  id serial not null,
  hive_author text not null,
  hive_balance double precision null,
  hp_balance double precision null,
  hbd_balance double precision null,
  hbd_savings_balance double precision null,
  has_voted_in_witness boolean null,
  eth_address character varying null,
  gnars_balance double precision null,
  gnars_votes double precision null,
  skatehive_nft_balance double precision null,
  max_voting_power_usd double precision null,
  last_updated timestamp without time zone null,
  last_post timestamp without time zone null,
  post_count integer null,
  points double precision null,
  giveth_donations_usd numeric null default 0,
  giveth_donations_amount numeric null default 0,
  constraint leaderboard_pkey primary key (id),
  constraint leaderboard_hive_author_key unique (hive_author)
) TABLESPACE pg_default;
```

3. Add your Supabase URL and Anon Key to the `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🎯 Goals of the API

The Skatehive Leaderboard API aims to:

- Aggregate data from Hive and Ethereum blockchains.
- Provide a leaderboard for the Skatehive community.
- Enhance community engagement by showcasing top contributors.

## 🌟 Benefits for the Community

- **Transparency**: Easily track and verify contributions.
- **Recognition**: Highlight top contributors and their achievements.
- **Engagement**: Foster a competitive and collaborative environment.

## 🏋️ Skatehive Point System

We’ve developed a point system to rank users based on their support and contributions to the Skatehive community. Here’s how it works:

### **Point Categories**
| **Category**              | **Points**                                                                 |
|---------------------------|----------------------------------------------------------------------------|
| **Hive Balance**          | 0.1 points per Hive, capped at 1,000 Hive (max 100 points)                 |
| **Hive Power (HP)**       | 0.5 points per HP, capped at 12,000 HP (max 6,000 points)                  |
| **Gnars Votes**           | 30 points per Gnars Vote                                                   |
| **Skatehive NFTs**        | 50 points per Skatehive NFT                                                |
| **Witness Vote**          | 1000 points for voting for the Skatehive witness                           |
| **HBD Savings**           | 0.2 points per HBD in savings, capped at 1,000 HBD (max 200 points)        |
| **Number of Posts**       | 0.1 points per post, capped at 3,000 posts (max 300 points)                |
| **Voting Power**          | 1000 points per USD of voting power                                        |
| **Giveth Donations**      | 5 points per USD donated, capped at 1,000 USD (max 5,000 points)           |
| **Last Post Activity**    | 0 points deducted if last post within 7 days, up to 100 points deducted    |
| **Ethereum Wallet Bonus** | 5000 points for having a valid Ethereum wallet                             |

### **Total Points Formula**

```
Total Points =
(Capped Hive Points) +
(Capped HP Points) +
(Gnars Votes Points) +
(Skatehive NFT Points) +
(Witness Vote Points) +
(Capped HBD Savings Points) +
(Capped Post Points) +
(Voting Power Points) -
(Inactivity Penalty) +
(Ethereum Wallet Bonus)
```

### **Benefits of the Point System**

- **Recognition**: Reward top contributors.
- **Engagement**: Encourage active participation.
- **Transparency**: Users can see how their contributions are valued.

By fostering a supportive and engaged community, we make Skatehive stronger and more vibrant!

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.