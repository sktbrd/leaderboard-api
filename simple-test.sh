#!/bin/bash

echo "🛹 SKATEHIVE API TEST RESULTS 🛹"
echo "=================================="

BASE_URL="http://localhost:3000"

# Function to test endpoint
test_ep() {
    local endpoint=$1
    local name=$2
    echo -n "Testing $name ($endpoint): "
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    
    if [ "$status" = "200" ]; then
        echo "✅ Working ($status)"
    elif [ "$status" = "404" ]; then
        echo "❌ Not Found ($status)"
    elif [ "$status" = "500" ]; then
        echo "🔥 Server Error ($status)"
    else
        echo "⚠️ Status: $status"
    fi
}

echo ""
echo "V2 CORE ENDPOINTS:"
test_ep "/api/v2" "V2 Overview"
test_ep "/api/v2/leaderboard" "V2 Leaderboard"

echo ""
echo "V2 FEED ENDPOINTS:"
test_ep "/api/v2/feed" "General Feed"
test_ep "/api/v2/feed/trending" "Trending Feed"
test_ep "/api/v2/skatesnaps" "SkateSnaps"
test_ep "/api/v2/skatesnaps/trending" "Trending SkateSnaps"

echo ""
echo "V2 SOCIAL ENDPOINTS:"
test_ep "/api/v2/profile" "All Profiles"
test_ep "/api/v2/profile/web3warrior" "User Profile"

echo ""
echo "V2 UTILITY ENDPOINTS:"
test_ep "/api/v2/comments" "Comments"
test_ep "/api/v2/market" "Market Data"
test_ep "/api/v2/skatespots" "Skate Spots"

echo ""
echo "V1 LEGACY ENDPOINTS:"
test_ep "/api/skatehive" "Skatehive Data"
test_ep "/api/leaderboard" "Legacy Leaderboard"
test_ep "/api/ethHelpers?address=0x742d35Cc6634C0532925a3b8D162Be00C9B2A26F&method=balance" "ETH Helpers"

echo ""
echo "SAMPLE WORKING ENDPOINT RESPONSES:"
echo "=================================="

echo ""
echo "📊 /api/v2 Response:"
curl -s "$BASE_URL/api/v2" | head -3

echo -e "\n📈 /api/skatehive Response:"
curl -s "$BASE_URL/api/skatehive" | head -3
