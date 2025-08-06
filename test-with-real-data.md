# Quick Test Commands with Real Data

## Test Variables

- **Username**: `xvlad`
- **Community**: `hive-173115`
- **ETH Address**: `0x41CB654D1F47913ACAB158a8199191D160DAbe4A`

## Key Endpoint Tests

### Profile Endpoint

```bash
curl -s "http://localhost:3000/api/v2/profile/xvlad" | jq
```

### ETH Helper Endpoints

```bash
# ETH Balance
curl -s "http://localhost:3000/api/ethHelpers?address=0x41CB654D1F47913ACAB158a8199191D160DAbe4A&method=balance" | jq

# ETH Votes
curl -s "http://localhost:3000/api/ethHelpers?address=0x41CB654D1F47913ACAB158a8199191D160DAbe4A&method=votes" | jq

# NFT Balance
curl -s "http://localhost:3000/api/ethHelpers?address=0x41CB654D1F47913ACAB158a8199191D160DAbe4A&method=skatehiveNFTBalance" | jq
```

### Feed Endpoints

```bash
# General feed
curl -s "http://localhost:3000/api/v2/feed" | jq

# User feed
curl -s "http://localhost:3000/api/v2/feed/xvlad?username=xvlad" | jq

# Trending
curl -s "http://localhost:3000/api/v2/feed/trending" | jq
```

### Social Endpoints

```bash
# Followers
curl -s "http://localhost:3000/api/v2/followers/xvlad?username=xvlad" | jq

# Following
curl -s "http://localhost:3000/api/v2/following/xvlad?username=xvlad" | jq
```

### SkateSnaps

```bash
# All skatesnaps
curl -s "http://localhost:3000/api/v2/skatesnaps" | jq

# User skatesnaps
curl -s "http://localhost:3000/api/v2/skatesnaps/xvlad?username=xvlad" | jq
```

### Wallet

```bash
# User balance
curl -s "http://localhost:3000/api/v2/balance/xvlad?username=xvlad" | jq
```

### Leaderboard

```bash
# Legacy leaderboard
curl -s "http://localhost:3000/api/skatehive" | jq

# V2 leaderboard
curl -s "http://localhost:3000/api/v2/leaderboard" | jq

# Community leaderboard
curl -s "http://localhost:3000/api/leaderboard?community=hive-173115" | jq
```

### Quick Status Check

```bash
# Check if endpoints respond
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/v2/profile/xvlad" && echo " - Profile"
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/v2/feed" && echo " - Feed"
curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/v2/skatesnaps" && echo " - SkateSnaps"
```
