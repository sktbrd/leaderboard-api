# 🛹 Skatehive API

Welcome to the **Skatehive API**! A comprehensive REST API for the skateboarding community on the Hive blockchain. This application provides access to community data, user profiles, content feeds, social interactions, economic data, and much more for the Skatehive community (hive-173115).

## 🎯 What is Skatehive?

**Skatehive** is the premier skateboarding community on the Hive blockchain, bringing together skaters from around the world to share content, earn rewards, and build a decentralized skateboarding ecosystem.

### 🛹 Community Features

- **Decentralized Social Network**: Built on Hive blockchain for censorship resistance
- **Earn While Skating**: Content creators earn HBD and HIVE tokens
- **NFT Integration**: Skatehive NFTs and community tokens
- **Global Community**: Skaters from every continent sharing their passion
- **Multi-chain Support**: Hive blockchain + Ethereum integration

## 🚀 API Overview

### 🏆 Core Features

- **User Profiles & Social**: Comprehensive skater profiles with followers, following, and social interactions
- **Content Management**: Skateboarding posts, videos, comments, and community updates
- **SkateSnaps**: Short-form skateboarding content (like TikTok for skaters)
- **Community Leaderboard**: Ranking system based on contributions and engagement
- **Economic Data**: Token balances, rewards, market data, and wallet information
- **Blockchain Integration**: Hive and Ethereum wallet data and interactions
- **Skatespots**: Location-based skateboarding venue and spot information

### 🔥 Key API Categories

#### 👥 **Social & Community**

- User profiles with achievements and statistics
- Followers/following relationships
- Comments and community interactions
- Social reputation and influence metrics

#### 📱 **Content & Media**

- General community feed with skateboarding content
- SkateSnaps (short-form videos and photos)
- Trending posts and viral content
- User-specific content streams

#### 🏆 **Gamification & Recognition**

- Community leaderboard with comprehensive scoring
- Achievement badges and recognition systems
- Contribution tracking and rewards
- Competition rankings and tournaments

#### 💰 **Economy & Finance**

- Hive wallet balances (HIVE, HBD, HP)
- Resource credits and voting power
- Token rewards and earnings tracking
- Market data and price information

#### 🌍 **Location & Discovery**

- Skateboarding spots and locations worldwide
- Venue information and community ratings
- Geographic content discovery
- Local community connections

#### 🔧 **Blockchain Integration**

- Hive blockchain operations (posts, votes, transfers)
- Ethereum wallet integration and NFT tracking
- Multi-chain asset management
- Donation tracking and philanthropy features

### 🌐 API Architecture

#### **V2 API** (Modern & Recommended)

- **Enhanced Features**: Advanced functionality with optimized performance
- **Comprehensive Data**: Rich response formats with detailed metadata
- **Modern Standards**: RESTful design with consistent patterns
- **Real-time Integration**: Live blockchain data with smart caching

#### **V1 API** (Legacy Support)

- **Backward Compatibility**: Maintained for existing integrations
- **Stable Interface**: Proven endpoints with reliable performance
- **Migration Path**: Clear upgrade path to V2 features

#### **Utility Endpoints**

- **Ethereum Integration**: Multi-chain asset and NFT tracking
- **Maintenance Operations**: Cron jobs and data synchronization
- **Developer Tools**: Testing and debugging utilities

## 📚 Quick Links

### 🔧 Developer Resources

- **📖 Interactive API Docs**: [http://localhost:3000/docs](http://localhost:3000/docs) (Swagger UI)
- **🎯 API Overview**: [http://localhost:3000/api/v2](http://localhost:3000/api/v2)
- **📋 API Routes Documentation**: [src/app/api/README.md](src/app/api/README.md)
- **🧪 Testing Suite**: [tests/README.md](tests/README.md)

### 🌍 Live API

- **Production API**: https://api.skatehive.app
- **Community Data**: https://api.skatehive.app/api/skatehive
- **Skatehive Website**: https://skatehive.app
- **Hive Community**: https://peakd.com/c/hive-173115

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
git clone https://github.com/sktbrd/skatehive-api.git
cd skatehive-api
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

## 📚 API Documentation & Testing

### API Documentation

Access the comprehensive API documentation with interactive Swagger UI:

- **Documentation**: [http://localhost:3000/docs](http://localhost:3000/docs)
- **API Overview**: [http://localhost:3000/api/v2](http://localhost:3000/api/v2)

### Testing Suite

The project includes a comprehensive testing suite in the `/tests` directory:

```bash
# Run full API test suite
bash tests/live-test.sh

# Quick health check
bash tests/quick-status-check.sh

# Individual endpoint testing
bash tests/test-api-endpoints.sh
```

See `/tests/README.md` for detailed testing documentation.

### API Versions

- **V2 API**: Modern endpoints at `/api/v2/*` (recommended)
- **V1 API**: Legacy endpoints at `/api/v1/*` (maintained for compatibility)

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

## 🎯 Goals of the Skatehive API

The Skatehive API aims to:

- **Empower the Community**: Provide comprehensive tools for skateboarding community interaction and growth
- **Blockchain Integration**: Seamlessly connect Hive and Ethereum blockchain data for multi-chain experiences
- **Content Discovery**: Enable easy discovery of skateboarding content, creators, and communities
- **Economic Transparency**: Track contributions, rewards, and economic activity within the ecosystem
- **Social Connections**: Foster relationships between skaters worldwide through profiles and social features
- **Innovation Platform**: Serve as the foundation for skateboarding dApps and community tools

## 🌟 Benefits for the Community

## 🌟 Benefits for the Community

- **Transparency**: Easily track and verify all community contributions and activities
- **Recognition**: Highlight top contributors, content creators, and community leaders
- **Engagement**: Foster competitive and collaborative environment through gamification
- **Accessibility**: Provide easy-to-use API for developers building skateboarding applications
- **Decentralization**: Leverage blockchain technology for censorship-resistant community building
- **Innovation**: Enable new use cases and applications for the skateboarding community

## 📊 Featured Systems

### 🏆 Community Leaderboard

The leaderboard system ranks users based on comprehensive contributions to the Skatehive ecosystem. See the [Leaderboard Documentation](src/app/api/leaderboard/README.md) for detailed scoring information.

### 📱 SkateSnaps

Short-form skateboarding content system designed for quick sharing and discovery of skateboarding moments, tricks, and community highlights.

### 🌍 Skatespots

Location-based system for discovering and sharing information about skateboarding locations, parks, and spots worldwide.

### 💰 Economic Integration

Comprehensive tracking of Hive and Ethereum assets, including tokens, NFTs, donations, and reward distributions.

### 💰 Economic Integration

Comprehensive tracking of Hive and Ethereum assets, including tokens, NFTs, donations, and reward distributions.

## 🔧 Technical Architecture

### 🗄️ Database Systems

- **HAFSQL**: Primary database for Hive blockchain data
- **HiveSQL**: Alternative Hive data access for complex queries
- **Supabase**: Legacy data storage and real-time features

### 🔗 Blockchain Integration

- **Hive Blockchain**: Social features, content, and rewards
- **Ethereum Network**: NFTs, tokens, and donation tracking
- **Multi-chain Support**: Cross-chain asset and activity tracking

### 📡 External Services

- **Market Data**: Real-time price feeds and market information
- **IPFS**: Decentralized media storage and delivery
- **Analytics**: Community growth and engagement metrics

## 📚 Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🚀 Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
