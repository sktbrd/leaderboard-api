#!/bin/bash

# 🛹 SKATEHIVE API TEST - LIVE DATA 🛹
# Testing with real Skatehive community data

BASE_URL="http://localhost:3000"

# Test Variables
USERNAME="xvlad"
ETH_ADDRESS="0x41CB654D1F47913ACAB158a8199191D160DAbe4A"
COMMUNITY="hive-173115"

echo "🛹 SKATEHIVE API LIVE TESTING 🛹"
echo "================================="
echo "Username: $USERNAME"
echo "Community: $COMMUNITY"  
echo "ETH Address: $ETH_ADDRESS"
echo "Base URL: $BASE_URL"
echo ""

# Function to test endpoint with real response
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    
    echo -e "🔍 Testing: $method $endpoint"
    echo -e "📝 Description: $description"
    
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint")
    echo -e "📊 Status: $status"
    
    if [ "$status" = "200" ]; then
        echo -e "✅ Response Preview:"
        curl -s "$BASE_URL$endpoint" | head -5
    elif [ "$status" = "404" ]; then
        echo -e "❌ Not Found - Response:"
        curl -s "$BASE_URL$endpoint"
    elif [ "$status" = "500" ]; then
        echo -e "🔥 Server Error - Response:"
        curl -s "$BASE_URL$endpoint"
    else
        echo -e "⚠️  Unexpected Status - Response:"
        curl -s "$BASE_URL$endpoint" | head -3
    fi
    
    echo ""
    echo "---"
    echo ""
}

echo "🚀 CORE API ENDPOINTS"
echo "====================="
test_endpoint "GET" "/api/v2" "V2 API Overview"
test_endpoint "GET" "/api/v2/leaderboard" "V2 Leaderboard Data"

echo "👤 USER PROFILE ENDPOINTS"
echo "========================="
test_endpoint "GET" "/api/v2/profile/$USERNAME" "User Profile for $USERNAME"
test_endpoint "GET" "/api/v2/profile" "All Profiles"

echo "🌐 SOCIAL ENDPOINTS"
echo "==================="
test_endpoint "GET" "/api/v2/followers/$USERNAME?username=$USERNAME" "User Followers"
test_endpoint "GET" "/api/v2/following/$USERNAME?username=$USERNAME" "User Following"

echo "📰 FEED ENDPOINTS"
echo "================="
test_endpoint "GET" "/api/v2/feed" "General Feed"
test_endpoint "GET" "/api/v2/feed?page=1&limit=5" "Feed with Pagination"
test_endpoint "GET" "/api/v2/feed/$USERNAME?username=$USERNAME" "User Feed"
test_endpoint "GET" "/api/v2/feed/trending" "Trending Feed"

echo "📸 SKATESNAPS ENDPOINTS"
echo "======================="
test_endpoint "GET" "/api/v2/skatesnaps" "All SkateSnaps"
test_endpoint "GET" "/api/v2/skatesnaps?page=1&limit=3" "SkateSnaps Paginated"
test_endpoint "GET" "/api/v2/skatesnaps/$USERNAME?username=$USERNAME" "User SkateSnaps"
test_endpoint "GET" "/api/v2/skatesnaps/trending" "Trending SkateSnaps"

echo "💰 WALLET ENDPOINTS"
echo "==================="
test_endpoint "GET" "/api/v2/balance/$USERNAME?username=$USERNAME" "User Balance"

echo "🛠️ UTILITY ENDPOINTS"
echo "===================="
test_endpoint "GET" "/api/v2/comments" "Comments"
test_endpoint "GET" "/api/v2/market" "Market Data"
test_endpoint "GET" "/api/v2/skatespots" "Skate Spots"

echo "🔗 ETHEREUM ENDPOINTS"
echo "====================="
test_endpoint "GET" "/api/ethHelpers?address=$ETH_ADDRESS&method=balance" "ETH Balance"
test_endpoint "GET" "/api/ethHelpers?address=$ETH_ADDRESS&method=votes" "ETH Votes"
test_endpoint "GET" "/api/ethHelpers?address=$ETH_ADDRESS&method=skatehiveNFTBalance" "NFT Balance"

echo "📊 LEGACY ENDPOINTS"
echo "==================="
test_endpoint "GET" "/api/skatehive" "Legacy Skatehive Data"
test_endpoint "GET" "/api/leaderboard" "Legacy Leaderboard"
test_endpoint "GET" "/api/leaderboard?community=$COMMUNITY" "Community Leaderboard"

echo "🔄 V1 ENDPOINTS"
echo "==============="
test_endpoint "GET" "/api/v1/profile/$USERNAME" "V1 User Profile"
test_endpoint "GET" "/api/v1/feed" "V1 Feed"
test_endpoint "GET" "/api/v1/balance/$USERNAME" "V1 Balance"

echo ""
echo "🎯 TESTING SUMMARY"
echo "=================="
echo "✅ Look for Status: 200 (working endpoints)"
echo "❌ Status: 404 might indicate missing data"
echo "🔥 Status: 500 indicates server/database issues"
echo ""
echo "📋 Next steps:"
echo "1. Check database connectivity for 500 errors"
echo "2. Verify user '$USERNAME' exists in Hive blockchain"
echo "3. Create README files for working endpoints"
