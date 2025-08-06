# V2 Balance API

## Endpoint

`GET /api/v2/balance/{username}`

## Description

Provides comprehensive wallet and balance information for Skatehive community users, including Hive tokens, resource credits, voting power, and transaction history.

## Request Examples

### Basic Balance Query

```bash
curl -X GET "http://localhost:3000/api/v2/balance/xvlad"
```

### With Additional Details

```bash
curl -X GET "http://localhost:3000/api/v2/balance/xvlad?include=transactions&limit=10"
```

### Resource Credits Focus

```bash
curl -X GET "http://localhost:3000/api/v2/balance/xvlad?include=rc_details"
```

## Path Parameters

### Required

- **username** (string): Hive blockchain username

## Query Parameters (Optional)

- **include** (string): Additional data to include - "transactions", "rc_details", "delegations", "savings", "all"
- **limit** (integer): Number of recent transactions to return (1-50, default: 10)
- **currency** (string): Display currency for conversions - "USD", "EUR", "BTC" (default: "USD")

## Response Format

### Successful Response

```json
{
  "success": true,
  "data": {
    "user": {
      "username": "xvlad",
      "displayName": "Vlad Skates",
      "avatar": "https://example.com/avatar.jpg",
      "reputation": 65.43,
      "lastActive": "2024-01-15T14:30:00.000Z"
    },
    "balances": {
      "hive": {
        "available": "125.456 HIVE",
        "staked": "1,205.789 HIVE",
        "total": "1,331.245 HIVE",
        "pendingUnstake": "50.000 HIVE",
        "unstakeDate": "2024-02-15T00:00:00.000Z"
      },
      "hbd": {
        "available": "23.67 HBD",
        "savings": "100.00 HBD",
        "total": "123.67 HBD",
        "savingsInterest": "3.2%"
      },
      "hp": {
        "own": "1,205.789 HP",
        "delegatedIn": "200.000 HP",
        "delegatedOut": "50.000 HP",
        "effective": "1,355.789 HP",
        "votingPower": "94.2%",
        "maxVoteValue": "$2.45"
      }
    },
    "resourceCredits": {
      "current": "94.8%",
      "max": "1,355,789",
      "used": "70,500",
      "remaining": "1,285,289",
      "rechargeRate": "20% per day",
      "estimatedFull": "2024-01-16T08:00:00.000Z"
    },
    "economics": {
      "accountValue": {
        "hive": "1,331.245 HIVE",
        "usd": "$398.45",
        "btc": "0.00934 BTC"
      },
      "votingValue": {
        "current": "$2.31",
        "max": "$2.45",
        "influence": "0.025%"
      },
      "earnings": {
        "thisMonth": "12.45 HBD",
        "lastMonth": "18.67 HBD",
        "allTime": "456.78 HBD"
      }
    },
    "activity": {
      "postsThisMonth": 8,
      "commentsThisMonth": 23,
      "votesGiven": 156,
      "votesReceived": 89,
      "lastPost": "2024-01-14T16:20:00.000Z",
      "lastVote": "2024-01-15T14:30:00.000Z"
    }
  },
  "metadata": {
    "lastUpdated": "2024-01-15T15:00:00.000Z",
    "priceData": {
      "hive": "$0.299",
      "hbd": "$1.001",
      "btc": "$42,650.00"
    },
    "community": "hive-173115"
  }
}
```

### With Transactions (include=transactions)

```json
{
  "success": true,
  "data": {
    // ... basic balance data ...
    "transactions": [
      {
        "id": "tx_abc123",
        "type": "transfer",
        "timestamp": "2024-01-15T12:30:00.000Z",
        "from": "gnars",
        "to": "xvlad",
        "amount": "5.000 HIVE",
        "memo": "Great post about kickflips! 🛹",
        "status": "confirmed",
        "blockNumber": 81234567
      },
      {
        "id": "tx_def456",
        "type": "vote_reward",
        "timestamp": "2024-01-15T10:15:00.000Z",
        "author": "xvlad",
        "permlink": "skatehive-progress-update",
        "amount": "2.345 HBD",
        "voters": 23,
        "status": "pending",
        "payoutDate": "2024-01-22T10:15:00.000Z"
      },
      {
        "id": "tx_ghi789",
        "type": "power_up",
        "timestamp": "2024-01-14T16:00:00.000Z",
        "from": "xvlad",
        "amount": "50.000 HIVE",
        "newHivePower": "1,205.789 HP",
        "status": "confirmed"
      }
    ]
  }
}
```

### With Resource Credits Details (include=rc_details)

```json
{
  "success": true,
  "data": {
    // ... basic data ...
    "resourceCredits": {
      "current": "94.8%",
      "max": "1,355,789",
      "used": "70,500",
      "remaining": "1,285,289",
      "rechargeRate": "20% per day",
      "breakdown": {
        "posts": "45,000 RC",
        "comments": "15,000 RC",
        "votes": "8,500 RC",
        "transfers": "2,000 RC"
      },
      "dailyUsage": {
        "posts": 3,
        "comments": 12,
        "votes": 45,
        "transfers": 2,
        "totalRC": "52,000 RC"
      },
      "projectedDepletion": "never",
      "recommendations": [
        "Your RC usage is healthy",
        "Consider powering up for more RC"
      ]
    }
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "User not found" | "Invalid username" | "Blockchain query failed",
  "details": "Additional error information"
}
```

## Status Codes

- **200 OK**: Successfully returns balance data
- **400 Bad Request**: Invalid username or parameters
- **404 Not Found**: User not found on Hive blockchain
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Blockchain connection error

## Balance Components

### HIVE Token

- **Available**: Liquid HIVE ready for transactions
- **Staked**: HIVE powered up as Hive Power (HP)
- **Pending Unstake**: HIVE being powered down (13 week process)
- **Total**: Combined liquid + staked HIVE

### HBD (Hive Backed Dollar)

- **Available**: Liquid HBD for spending
- **Savings**: HBD earning 20% APR in savings
- **Interest Rate**: Current APR on HBD savings

### Hive Power (HP)

- **Own HP**: User's powered up HIVE
- **Delegated In**: HP delegated to user by others
- **Delegated Out**: HP user delegated to others
- **Effective HP**: Total HP available for voting
- **Voting Power**: Current voting strength percentage
- **Max Vote Value**: USD value of 100% vote

### Resource Credits (RC)

- **Current Percentage**: RC level (0-100%)
- **Max RC**: Maximum RC based on HP
- **Used/Remaining**: Current usage statistics
- **Recharge Rate**: How fast RC regenerates
- **Activity Breakdown**: RC usage by action type

## Transaction Types

### Transfer Types

- **transfer**: HIVE/HBD transfers between users
- **transfer_to_savings**: Deposits to HBD savings
- **transfer_from_savings**: Withdrawals from savings
- **delegate_vesting_shares**: HP delegations

### Reward Types

- **author_reward**: Earnings from posts/comments
- **curation_reward**: Earnings from voting
- **vote_reward**: Pending post rewards

### Staking Types

- **transfer_to_vesting**: Powering up HIVE to HP
- **withdraw_vesting**: Powering down HP to HIVE
- **fill_vesting_withdraw**: Weekly power down payments

## Price Data Integration

- **Real-time Prices**: HIVE and HBD current market prices
- **USD Conversions**: Account value in US dollars
- **BTC Conversions**: Account value in Bitcoin
- **Update Frequency**: Price data updated every 5 minutes

## Caching Strategy

- **Balance Data**: 2 minutes cache
- **Transaction History**: 5 minutes cache
- **RC Data**: 1 minute cache (more dynamic)
- **Price Data**: 5 minutes cache

## Performance Notes

- Balance queries can be resource-intensive
- Consider pagination for transaction history
- RC calculations require real-time blockchain data
- Price conversions add API call latency

## Use Cases

- **User Profiles**: Display wallet information
- **Portfolio Tracking**: Monitor account value changes
- **Resource Management**: Track RC usage and voting power
- **Transaction History**: Show financial activity
- **Mobile Wallets**: Comprehensive balance interface
- **Analytics**: Community wealth and activity analysis

## Dependencies

- **HiveClient**: Blockchain balance and transaction data
- **Price APIs**: Real-time HIVE/HBD market prices
- **RC System**: Resource credit calculations
- **Delegation Tracking**: HP delegation relationships

## Rate Limiting

- **Standard Queries**: 500 requests per hour per IP
- **With Transactions**: 100 requests per hour (more expensive)
- **RC Details**: 200 requests per hour
- **Price Conversions**: May have external API limits

## Security Notes

- **Public Data**: All balance information is publicly available on blockchain
- **No Private Keys**: API never handles or requires private keys
- **Read-Only**: This endpoint only retrieves data, cannot modify balances
- **Rate Limiting**: Prevents abuse and overloading blockchain nodes

## Skatehive Integration

- **Community Focus**: Optimized for skateboarding community users
- **Token Integration**: May include skateboarding-related tokens
- **Reward Tracking**: Special handling for skateboarding content rewards
- **Community Analytics**: Balance data contributes to leaderboard scoring

## Mobile Optimization

- **Lightweight Queries**: Option to exclude heavy data
- **Essential Data**: Focus on most important balance information
- **Offline Support**: Cache balance data for offline viewing
- **Push Notifications**: Balance change alerts (separate service)
