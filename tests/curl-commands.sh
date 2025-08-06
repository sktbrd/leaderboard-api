# Quick API Test Commands
# Copy and paste these commands to test each endpoint

# Set base URL
BASE_URL="http://localhost:3000"

# ===============================
# V1 LEGACY ENDPOINTS
# ===============================

# Basic leaderboard
curl -s "$BASE_URL/api/skatehive" | jq

# Ethereum helpers
curl -s "$BASE_URL/api/ethHelpers?address=0x742d35Cc6634C0532925a3b8D162Be00C9B2A26F&method=balance" | jq
curl -s "$BASE_URL/api/ethHelpers?address=0x742d35Cc6634C0532925a3b8D162Be00C9B2A26F&method=votes" | jq

# Leaderboard endpoints
curl -s "$BASE_URL/api/leaderboard" | jq
curl -s "$BASE_URL/api/leaderboard?community=hive-173115" | jq

# ===============================
# V2 CORE ENDPOINTS  
# ===============================

# API overview
curl -s "$BASE_URL/api/v2" | jq

# V2 Leaderboard
curl -s "$BASE_URL/api/v2/leaderboard" | jq

# ===============================
# V2 PROFILE & SOCIAL
# ===============================

# Profile endpoints
curl -s "$BASE_URL/api/v2/profile" | jq
curl -s "$BASE_URL/api/v2/profile/web3warrior" | jq

# Social endpoints
curl -s "$BASE_URL/api/v2/followers/web3warrior?username=web3warrior" | jq
curl -s "$BASE_URL/api/v2/following/web3warrior?username=web3warrior" | jq

# ===============================
# V2 FEED ENDPOINTS
# ===============================

# Feed endpoints
curl -s "$BASE_URL/api/v2/feed" | jq
curl -s "$BASE_URL/api/v2/feed?page=1&limit=5" | jq
curl -s "$BASE_URL/api/v2/feed/web3warrior?username=web3warrior" | jq
curl -s "$BASE_URL/api/v2/feed/trending" | jq

# ===============================
# V2 WALLET ENDPOINTS
# ===============================

# Balance endpoints
curl -s "$BASE_URL/api/v2/balance/web3warrior?username=web3warrior" | jq

# ===============================
# V2 SKATESNAPS ENDPOINTS
# ===============================

# SkateSnaps endpoints
curl -s "$BASE_URL/api/v2/skatesnaps" | jq
curl -s "$BASE_URL/api/v2/skatesnaps?page=1&limit=5" | jq
curl -s "$BASE_URL/api/v2/skatesnaps/web3warrior?username=web3warrior" | jq
curl -s "$BASE_URL/api/v2/skatesnaps/trending" | jq

# ===============================
# V2 UTILITY ENDPOINTS
# ===============================

# Comments
curl -s "$BASE_URL/api/v2/comments" | jq
curl -s "$BASE_URL/api/v2/comments?page=1&limit=5" | jq

# Market data
curl -s "$BASE_URL/api/v2/market" | jq

# Skate spots
curl -s "$BASE_URL/api/v2/skatespots" | jq
curl -s "$BASE_URL/api/v2/skatespots?location=california" | jq

# ===============================
# V1 ADDITIONAL ENDPOINTS
# ===============================

# V1 Profile
curl -s "$BASE_URL/api/v1/profile/web3warrior" | jq

# V1 Balance
curl -s "$BASE_URL/api/v1/balance/web3warrior" | jq

# V1 Feed
curl -s "$BASE_URL/api/v1/feed" | jq
curl -s "$BASE_URL/api/v1/feed/trending" | jq
curl -s "$BASE_URL/api/v1/feed/web3warrior" | jq

# V1 Social
curl -s "$BASE_URL/api/v1/followers/web3warrior" | jq
curl -s "$BASE_URL/api/v1/following/web3warrior" | jq

# V1 Comments & Market
curl -s "$BASE_URL/api/v1/comments" | jq
curl -s "$BASE_URL/api/v1/market" | jq

# ===============================
# MAINTENANCE/CRON ENDPOINTS
# ===============================

# Cron endpoints (may be protected)
curl -s "$BASE_URL/api/cron/update" | jq
curl -s "$BASE_URL/api/cron/v2" | jq
curl -s "$BASE_URL/api/cron/v2/leaderboard" | jq

# ===============================
# INTERNAL/DEV ENDPOINTS  
# ===============================

# Development endpoints
curl -s "$BASE_URL/api/v2/__feed_old" | jq
curl -s "$BASE_URL/api/v2/__magazine" | jq  
curl -s "$BASE_URL/api/v2/__trending" | jq
curl -s "$BASE_URL/api/v2/__skatefeed" | jq
curl -s "$BASE_URL/api/v2/__fullprofile/web3warrior" | jq
curl -s "$BASE_URL/api/v2/__wallet/web3warrior" | jq

# ===============================
# POST ENDPOINTS (require data)
# ===============================

# Vote endpoint (requires proper payload)
# curl -s -X POST "$BASE_URL/api/v2/vote" -H "Content-Type: application/json" -d '{"vote_data":"here"}' | jq

# Create post endpoint (requires proper payload) 
# curl -s -X POST "$BASE_URL/api/v2/createpost" -H "Content-Type: application/json" -d '{"post_data":"here"}' | jq

# Create comment endpoint (requires proper payload)
# curl -s -X POST "$BASE_URL/api/v2/comments" -H "Content-Type: application/json" -d '{"comment_data":"here"}' | jq
