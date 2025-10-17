#!/bin/bash

# Transcode API Testing Script
# Make sure your Next.js server is running first: npm run dev

BASE_URL="http://localhost:3000"  # Change this if your server runs on a different port

echo "🚀 Testing Transcode API Endpoints"
echo "=================================="
echo ""

# Test 1: Check the status endpoint
echo "📊 1. Testing Status Endpoint"
echo "Command: curl -X GET ${BASE_URL}/api/transcode/status"
echo "Expected: Health status of all services"
echo ""
curl -X GET "${BASE_URL}/api/transcode/status" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n" \
  | jq '.' 2>/dev/null || cat
echo ""
echo "---"
echo ""

# Test 2: Test GET redirect to transcode service
echo "🔄 2. Testing GET Redirect (will redirect to active service)"
echo "Command: curl -X GET ${BASE_URL}/api/transcode"
echo "Expected: 302 redirect to healthy service"
echo ""
curl -X GET "${BASE_URL}/api/transcode" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\nRedirect URL: %{redirect_url}\nResponse Time: %{time_total}s\n" \
  -v 2>&1 | grep -E "(< HTTP|< Location|> GET)" || echo "Redirect occurred"
echo ""
echo "---"
echo ""

# Test 3: Test GET with query parameters
echo "🔗 3. Testing GET with Query Parameters"
echo "Command: curl -X GET ${BASE_URL}/api/transcode?format=mp4&quality=720p"
echo "Expected: 302 redirect with query parameters forwarded"
echo ""
curl -X GET "${BASE_URL}/api/transcode?format=mp4&quality=720p" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}\nRedirect URL: %{redirect_url}\nResponse Time: %{time_total}s\n" \
  -v 2>&1 | grep -E "(< HTTP|< Location|> GET)" || echo "Redirect occurred"
echo ""
echo "---"
echo ""

# Test 4: Test POST request (will forward to active service)
echo "📤 4. Testing POST Request Forward"
echo "Command: curl -X POST ${BASE_URL}/api/transcode"
echo "Expected: Request forwarded to healthy service"
echo ""
curl -X POST "${BASE_URL}/api/transcode" \
  -H "Content-Type: application/json" \
  -d '{"video_url": "https://example.com/video.mp4", "format": "mp4"}' \
  -w "\nHTTP Status: %{http_code}\nResponse Time: %{time_total}s\n"
echo ""
echo "---"
echo ""

# Test 5: Pretty-print status with jq (if available)
echo "✨ 5. Pretty Status Output (requires jq)"
echo "Command: curl -s ${BASE_URL}/api/transcode/status | jq"
echo ""
if command -v jq >/dev/null 2>&1; then
    curl -s "${BASE_URL}/api/transcode/status" | jq '{
        systemStatus: .summary.systemStatus,
        activeService: .summary.activeService.name,
        healthyServices: "\(.summary.healthyServices)/\(.summary.totalServices)",
        services: [.services[] | {
            name: .name,
            priority: .priority,
            healthy: .isHealthy,
            responseTime: .responseTime
        }]
    }'
else
    echo "jq not installed. Install with: brew install jq (macOS) or apt-get install jq (Ubuntu)"
    curl -s "${BASE_URL}/api/transcode/status"
fi

echo ""
echo "🏁 Testing Complete!"
echo ""
echo "💡 Tips:"
echo "- If you get connection errors, make sure your Next.js server is running: npm run dev"
echo "- Status endpoint should return 200 if at least one service is healthy"
echo "- Transcode endpoint should return 302 redirects for GET requests"
echo "- Check the redirect Location header to see which service is being used"