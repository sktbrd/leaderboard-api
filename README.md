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
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src
│   └── app
│       ├── api
│       │   ├── README.md
│       │   ├── cron
│       │   │   └── update
│       │   │       └── route.ts
│       │   ├── ethHelpers
│       │   │   └── route.ts
│       │   ├── leaderboard
│       │   │   └── route.ts
│       │   └── skatehive
│       │       └── route.ts
│       ├── favicon.ico
│       ├── globals.css
│       ├── layout.tsx
│       ├── page.module.css
│       ├── page.tsx
│       └── utils
│           ├── README.md
│           ├── convertVeststoHP.ts
│           ├── dataManager.ts
│           ├── databaseHelpers.ts
│           ├── ethereumUtils.ts
│           ├── fetchSubscribers.ts
│           ├── hiveUtils.ts
│           ├── supabaseClient.ts
│           ├── tokenAbi.ts
│           └── types.ts
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
CREATE TABLE leaderboard (
  id SERIAL PRIMARY KEY,
  hive_author VARCHAR NOT NULL,
  hive_balance FLOAT,
  hp_balance FLOAT,
  hbd_balance FLOAT,
  hbd_savings_balance FLOAT,
  has_voted_in_witness BOOLEAN,
  eth_address VARCHAR,
  gnars_balance FLOAT,
  gnars_votes FLOAT,
  skatehive_nft_balance FLOAT,
  max_voting_power_usd FLOAT,
  last_updated TIMESTAMP,
  last_post TIMESTAMP,
  post_count INT
);
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

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
