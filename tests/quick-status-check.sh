#!/bin/bash

# Quick API Status Checker
# This script tests all endpoints and shows only status codes

BASE_URL="http://localhost:3000"

echo "🛹 SKATEHIVE API STATUS CHECK 🛹"
echo "================================="
echo ""

# Function to check endpoint status
check_status() {
    local endpoint=$1
    local description=$2
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    
    if [ "$status" = "200" ]; then
        echo "✅ $status - $endpoint - $description"
    elif [ "$status" = "404" ]; then
        echo "❌ $status - $endpoint - $description"
    elif [ "$status" = "500" ]; then
        echo "🔥 $status - $endpoint - $description"
    else
        echo "⚠️  $status - $endpoint - $description"
    fi
}

echo "V1 LEGACY ENDPOINTS:"
check_status "/api/skatehive" "Skatehive leaderboard"
check_status "/api/ethHelpers?address=0x742d35Cc6634C0532925a3b8D162Be00C9B2A26F&method=balance" "ETH balance"
check_status "/api/leaderboard" "Leaderboard data"
check_status "/api/v1/profile/web3warrior" "V1 user profile"
check_status "/api/v1/feed" "V1 feed"
check_status "/api/v1/comments" "V1 comments"

echo ""
echo "V2 CORE ENDPOINTS:"
check_status "/api/v2" "V2 overview"
check_status "/api/v2/leaderboard" "V2 leaderboard"
check_status "/api/v2/profile" "All profiles"
check_status "/api/v2/profile/web3warrior" "User profile"

echo ""
echo "V2 FEED & SOCIAL:"
check_status "/api/v2/feed" "General feed"
check_status "/api/v2/feed/trending" "Trending feed"
check_status "/api/v2/followers/web3warrior?username=web3warrior" "User followers"
check_status "/api/v2/following/web3warrior?username=web3warrior" "User following"

echo ""
echo "V2 CONTENT & UTILITY:"
check_status "/api/v2/skatesnaps" "SkateSnaps"
check_status "/api/v2/skatesnaps/trending" "Trending snaps"
check_status "/api/v2/comments" "Comments"
check_status "/api/v2/market" "Market data"
check_status "/api/v2/skatespots" "Skate spots"

echo ""
echo "V2 WALLET:"
check_status "/api/v2/balance/web3warrior?username=web3warrior" "User balance"

echo ""
echo "DEVELOPMENT/INTERNAL:"
check_status "/api/v2/__fullprofile/web3warrior" "Full profile"
check_status "/api/v2/__wallet/web3warrior" "Full wallet"
check_status "/api/v2/__feed_old" "Old feed"

echo ""
echo "MAINTENANCE:"
check_status "/api/cron/update" "Data update"
check_status "/api/cron/v2" "V2 cron"

echo ""
echo "LEGEND:"
echo "✅ 200 - Working correctly"
echo "❌ 404 - Not found"  
echo "🔥 500 - Server error"
echo "⚠️  Other - Needs investigation"
