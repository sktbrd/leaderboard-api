# 🛹 Skatehive Leaderboard API Routes

This folder contains all API routes for the Skatehive Leaderboard application. The API is organized into different versions and categories to provide comprehensive access to skateboarding community data from the Hive blockchain and Ethereum.

## 📚 API Documentation

- **Interactive Documentation**: [http://localhost:3000/docs](http://localhost:3000/docs) (Swagger UI)
- **API Overview**: [http://localhost:3000/api/v2](http://localhost:3000/api/v2)
- **Production API**: https://api.skatehive.app

## 🏗️ API Structure Overview

```
api/
├── v2/              # Modern API (Recommended)
├── v1/              # Legacy API (Maintained for compatibility)
├── cron/            # Maintenance and data update endpoints
├── ethHelpers/      # Ethereum blockchain utilities
├── leaderboard/     # Legacy leaderboard endpoint
└── skatehive/       # Legacy Supabase data endpoint
```

## 🚀 V2 API (Modern & Recommended)

**Base URL**: `/api/v2`

The V2 API provides enhanced features, better performance, and comprehensive skateboarding community functionality.

### 🏆 Core Endpoints

| Endpoint              | Method | Description                               |
| --------------------- | ------ | ----------------------------------------- |
| `/api/v2`             | GET    | API overview and available endpoints      |
| `/api/v2/leaderboard` | GET    | Community leaderboard with scoring system |

### 👤 Profile & Social

| Endpoint                       | Method | Description                |
| ------------------------------ | ------ | -------------------------- |
| `/api/v2/profile`              | GET    | All user profiles          |
| `/api/v2/profile/{username}`   | GET    | Specific user profile data |
| `/api/v2/followers/{username}` | GET    | User's followers list      |
| `/api/v2/following/{username}` | GET    | Users being followed       |

### 📱 Content & Feeds

| Endpoint                        | Method | Description                      |
| ------------------------------- | ------ | -------------------------------- |
| `/api/v2/feed`                  | GET    | General community feed           |
| `/api/v2/feed/{username}`       | GET    | User-specific content feed       |
| `/api/v2/feed/trending`         | GET    | Trending community posts         |
| `/api/v2/skatesnaps`            | GET    | Short-form skateboarding content |
| `/api/v2/skatesnaps/{username}` | GET    | User's skate snaps               |
| `/api/v2/skatesnaps/trending`   | GET    | Trending skate snaps             |

### 💬 Engagement & Interaction

| Endpoint             | Method   | Description                |
| -------------------- | -------- | -------------------------- |
| `/api/v2/comments`   | GET/POST | Comments data and creation |
| `/api/v2/vote`       | POST     | Cast votes on content      |
| `/api/v2/createpost` | POST     | Create new posts           |

### 💰 Economy & Wallet

| Endpoint                     | Method | Description                   |
| ---------------------------- | ------ | ----------------------------- |
| `/api/v2/balance/{username}` | GET    | User wallet balance and stats |
| `/api/v2/market`             | GET    | Market data and token prices  |

### 🏢 Utilities

| Endpoint             | Method | Description                       |
| -------------------- | ------ | --------------------------------- |
| `/api/v2/skatespots` | GET    | Skateboarding locations and spots |

### 🔧 Development Endpoints (Internal)

| Endpoint                           | Method | Description                 |
| ---------------------------------- | ------ | --------------------------- |
| `/api/v2/__feed_old`               | GET    | Legacy feed implementation  |
| `/api/v2/__magazine`               | GET    | Magazine-style content      |
| `/api/v2/__skatefeed`              | GET    | Specialized skate feed      |
| `/api/v2/__trending`               | GET    | Trending algorithm testing  |
| `/api/v2/__fullprofile/{username}` | GET    | Extended profile data       |
| `/api/v2/__wallet/{username}`      | GET    | Detailed wallet information |

## 🔄 V1 API (Legacy)

**Base URL**: `/api/v1`

The V1 API is maintained for backward compatibility. New integrations should use V2.

### 🏆 Core Legacy Endpoints

| Endpoint                     | Method | Description             |
| ---------------------------- | ------ | ----------------------- |
| `/api/v1/leaderboard`        | GET    | Legacy leaderboard data |
| `/api/v1/profile/{username}` | GET    | V1 user profile format  |

### 📱 Legacy Feed System

| Endpoint                  | Method | Description                |
| ------------------------- | ------ | -------------------------- |
| `/api/v1/feed`            | GET    | General feed (V1 format)   |
| `/api/v1/feed/trending`   | GET    | Trending posts (V1 format) |
| `/api/v1/feed/{username}` | GET    | User feed (V1 format)      |

### 👥 Legacy Social Features

| Endpoint                       | Method | Description         |
| ------------------------------ | ------ | ------------------- |
| `/api/v1/followers/{username}` | GET    | V1 followers format |
| `/api/v1/following/{username}` | GET    | V1 following format |

### 💰 Legacy Wallet System

| Endpoint                     | Method | Description           |
| ---------------------------- | ------ | --------------------- |
| `/api/v1/balance/{username}` | GET    | V1 balance format     |
| `/api/v1/market`             | GET    | V1 market data format |

### 💬 Legacy Engagement

| Endpoint             | Method   | Description        |
| -------------------- | -------- | ------------------ |
| `/api/v1/comments`   | GET/POST | V1 comments system |
| `/api/v1/vote`       | POST     | V1 voting system   |
| `/api/v1/createpost` | POST     | V1 post creation   |

## 🔧 Utility & Maintenance Endpoints

### Ethereum Helpers

| Endpoint          | Method | Description                               |
| ----------------- | ------ | ----------------------------------------- |
| `/api/ethHelpers` | GET    | Ethereum utilities (balance, votes, NFTs) |

### Legacy Endpoints

| Endpoint           | Method   | Description                   |
| ------------------ | -------- | ----------------------------- |
| `/api/skatehive`   | GET      | Supabase legacy data          |
| `/api/leaderboard` | GET/POST | Legacy leaderboard operations |

### Maintenance & Cron Jobs

| Endpoint                   | Method | Description                |
| -------------------------- | ------ | -------------------------- |
| `/api/cron/update`         | GET    | Trigger data update job    |
| `/api/cron/v2`             | GET    | V2 maintenance overview    |
| `/api/cron/v2/leaderboard` | GET    | Update V2 leaderboard data |

## 🎯 Key Features

### Community Focus

- **Skatehive Community**: Specialized for hive-173115 community
- **Skateboarding Content**: Optimized for skate-related posts and media
- **Community Scoring**: Advanced point system for user rankings

### Blockchain Integration

- **Hive Blockchain**: Direct integration with Hive for social features
- **Ethereum Support**: Token balances, NFTs, and donation tracking
- **Real-time Data**: Live blockchain data with caching for performance

### Modern API Design

- **RESTful Architecture**: Standard HTTP methods and status codes
- **Pagination Support**: Efficient data loading with page/limit parameters
- **Error Handling**: Comprehensive error responses with details
- **Rate Limiting**: Protection against abuse and overuse

## 📊 Data Sources

### Primary Data Sources

- **HAFSQL Database**: Hive blockchain data and user activities
- **HiveClient**: Resource credits, voting power, and blockchain operations
- **Ethereum RPC**: Token balances, NFT data, and smart contract interactions

### Legacy Data Sources

- **Supabase**: Legacy leaderboard and user data (V1)
- **External APIs**: Market data and price information

## 🚀 Getting Started

### API Testing

```bash
# Test V2 API overview
curl -X GET "http://localhost:3000/api/v2"

# Test user profile
curl -X GET "http://localhost:3000/api/v2/profile/xvlad"

# Test leaderboard
curl -X GET "http://localhost:3000/api/v2/leaderboard"
```

### Authentication

- **GET Endpoints**: Generally public access
- **POST Endpoints**: May require authentication
- **Cron Endpoints**: Protected for internal use

### Rate Limiting

- **Standard**: 1000 requests/hour per IP
- **Authenticated**: 5000 requests/hour
- **POST Operations**: 100 requests/hour

## 🔗 External Links

- **Production API**: https://api.skatehive.app/api/skatehive
- **Skatehive Community**: https://skatehive.app
- **Hive Community**: https://peakd.com/c/hive-173115
- **Documentation**: [Interactive Swagger UI](http://localhost:3000/docs)

## 📈 Migration Guide

### From V1 to V2

1. **Update Base URLs**: Change `/api/v1/` to `/api/v2/`
2. **Review Response Formats**: V2 may have enhanced data structures
3. **Check New Features**: V2 includes SkateSnaps, enhanced profiles, and more
4. **Update Error Handling**: V2 has improved error responses

### Breaking Changes

- **Response Structure**: Some endpoints have enhanced data formats
- **Parameter Names**: Standardized parameter naming across endpoints
- **Pagination**: Consistent pagination across all paginated endpoints

## 🤝 Contributing

When adding new endpoints:

1. Follow RESTful conventions
2. Add comprehensive documentation
3. Include proper error handling
4. Add to the appropriate version (V1 for legacy, V2 for new features)
5. Update this README file

## 📞 Support

For API support and questions:

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check `/docs` for interactive API exploration
- **Community**: Join the Skatehive Discord community
