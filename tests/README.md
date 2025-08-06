# Skatehive Leaderboard API - Testing Suite

## Overview

This directory contains comprehensive testing scripts and documentation for the Skatehive Leaderboard API. These tools help validate API functionality, performance, and reliability.

## Test Files

### 🧪 Testing Scripts

#### `live-test.sh`

**Comprehensive API Testing Script**

- Tests all major API endpoints with real data
- Generates detailed status reports
- Uses real Skatehive community data for validation
- Outputs results to `API-TESTING-REPORT.md`

```bash
# Run comprehensive testing
bash tests/live-test.sh
```

#### `test-api-endpoints.sh`

**Detailed Endpoint Testing**

- Tests individual endpoints with full response capture
- Detailed error reporting and debugging information
- Supports custom base URLs and test data

```bash
# Run detailed endpoint testing
bash tests/test-api-endpoints.sh
```

#### `quick-status-check.sh`

**Fast Health Check Script**

- Quick HTTP status code validation
- Minimal response data capture
- Ideal for CI/CD pipelines and monitoring

```bash
# Quick health check
bash tests/quick-status-check.sh
```

#### `simple-test.sh`

**Basic Functionality Test**

- Tests core endpoints only
- Simple pass/fail validation
- Good for development workflow

```bash
# Basic functionality test
bash tests/simple-test.sh
```

#### `curl-commands.sh`

**Individual cURL Commands**

- Collection of standalone cURL commands
- Manual testing and debugging
- Copy-paste friendly commands

```bash
# Source commands or run individually
source tests/curl-commands.sh
```

### 📊 Reports and Documentation

#### `API-TESTING-REPORT.md`

**Generated Testing Report**

- Comprehensive API endpoint inventory
- Testing results with status codes
- Working vs. non-working endpoint analysis
- Recommendations for fixes and improvements

#### `test-with-real-data.md`

**Real Data Testing Documentation**

- Test scenarios with actual Skatehive community data
- Username: `xvlad`
- Community: `hive-173115`
- ETH Address: `0x41CB654D1F47913ACAB158a8199191D160DAbe4A`
- Verified test cases and expected outcomes

## Testing Methodology

### Test Data Sources

- **Real Users**: Actual Skatehive community members
- **Valid Community**: hive-173115 (official Skatehive community)
- **Blockchain Data**: Live Hive blockchain information
- **Ethereum Integration**: Real ETH addresses and transactions

### Testing Categories

#### 🏆 Core API Testing

- API overview endpoints (`/api/v2`)
- Authentication and authorization flows
- Error handling and status codes
- Rate limiting validation

#### 👥 Social Features

- User profiles and reputation
- Followers/following relationships
- Community interactions

#### 📱 Content Management

- Feed endpoints (general, user, trending)
- SkateSnaps (short-form content)
- Post creation and management

#### 💬 Engagement Systems

- Comments (GET/POST operations)
- Voting and curation
- Content interactions

#### 💰 Economic Features

- User balances and wallets
- Token integrations
- Market data endpoints

#### 🔧 Utility Functions

- Ethereum helpers
- Database connectivity
- External API integrations

## Running Tests

### Prerequisites

```bash
# Ensure the development server is running
pnpm dev

# Or for production testing
pnpm build && pnpm start
```

### Environment Setup

```bash
# Required environment variables
HAFSQL_HOST=your_hafsql_host
HAFSQL_PORT=your_hafsql_port
HAFSQL_DATABASE=your_database
HAFSQL_USERNAME=your_username
HAFSQL_PASSWORD=your_password
HIVE_CLIENT_API=your_hive_api_endpoint
```

### Test Execution

#### Full Test Suite

```bash
# Run all tests and generate report
cd tests/
bash live-test.sh

# Review results
cat API-TESTING-REPORT.md
```

#### Individual Test Scripts

```bash
# Quick health check
bash tests/quick-status-check.sh

# Detailed endpoint testing
bash tests/test-api-endpoints.sh

# Basic functionality
bash tests/simple-test.sh
```

#### Custom Testing

```bash
# Test specific endpoints
curl -X GET "http://localhost:3000/api/v2"
curl -X GET "http://localhost:3000/api/v2/profile/xvlad"
curl -X GET "http://localhost:3000/api/v2/leaderboard"
```

## Test Results Interpretation

### Status Codes

- **✅ 200 OK**: Endpoint working correctly
- **⚠️ 404 Not Found**: Expected for non-existent resources
- **❌ 500 Internal Server Error**: Database or configuration issue
- **🔄 Testing**: Endpoint structure correct, needs data connection

### Common Issues

- **Database Connection**: HAFSQL configuration required
- **Hive Blockchain**: API key and endpoint setup needed
- **Rate Limiting**: Too many requests during testing
- **Authentication**: POST endpoints require valid tokens

## Continuous Integration

### Automated Testing

```yaml
# GitHub Actions example
- name: Run API Tests
  run: |
    pnpm dev &
    sleep 10
    bash tests/quick-status-check.sh
    bash tests/simple-test.sh
```

### Monitoring

- Set up automated health checks using `quick-status-check.sh`
- Monitor API performance with detailed endpoint testing
- Track endpoint availability over time

## Contributing

### Adding New Tests

1. Create test script in `/tests` directory
2. Follow existing naming convention
3. Include error handling and status reporting
4. Update this README with test description

### Test Data Guidelines

- Use real but anonymized community data
- Include both positive and negative test cases
- Document expected outcomes
- Respect rate limiting and API guidelines

## Support

### Debugging Failed Tests

1. Check server logs for detailed error messages
2. Verify environment variable configuration
3. Confirm database connectivity
4. Review API endpoint implementation

### Getting Help

- Review `API-TESTING-REPORT.md` for detailed analysis
- Check individual endpoint README files
- Examine server logs for error details
- Test endpoints manually with cURL commands

## Security Notes

- Test data includes public blockchain information only
- No private keys or sensitive data in test scripts
- Rate limiting prevents abuse during testing
- All test endpoints are read-only operations (except where noted)
