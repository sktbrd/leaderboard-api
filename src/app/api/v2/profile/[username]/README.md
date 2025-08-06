# User Profile Endpoint

## Endpoint

`GET /api/v2/profile/{username}`

## Description

Retrieves comprehensive user profile information from the Hive blockchain, including account details, community statistics, and resource credits.

## Request

```bash
curl -X GET "http://localhost:3000/api/v2/profile/{username}"
```

## Parameters

- **username** (path parameter, required): Hive blockchain username

## Example Request

```bash
curl -X GET "http://localhost:3000/api/v2/profile/web3warrior"
```

## Response Format (Success)

```json
{
  "success": true,
  "data": {
    "name": "username",
    "reputation": 1234567,
    "json_metadata": {},
    "posting_metadata": {},
    "followers": 123,
    "followings": 456,
    "created_at": "2023-01-01T00:00:00.000Z",
    "last_vote_time": "2024-01-01T00:00:00.000Z",
    "last_root_post": "2024-01-01T00:00:00.000Z",
    "last_post": "2024-01-01T00:00:00.000Z",
    "total_posts": 100,
    "incoming_hp": "0.000 HIVE",
    "outgoing_hp": "0.000 HIVE",
    "creator": "",
    "reward_hive_balance": "0.000 HIVE",
    "reward_hbd_balance": "0.000 HBD",
    "reward_vests_balance": "0.000000 VESTS",
    "reward_vests_balance_hp": "0.000 HP",
    "vesting_withdraw_rate": "0.000000 VESTS",
    "proxy": "",
    "last_update": "2024-01-01T00:00:00.000Z",
    "community_followers": 50,
    "community_followings": 75,
    "community_totalposts": 25,
    "vp_percent": "100.00%",
    "rc_percent": "100.00%"
  },
  "headers": {}
}
```

## Response Format (User Not Found)

```json
{
  "success": false,
  "error": "Account not found"
}
```

## Response Format (Server Error)

```json
{
  "success": false,
  "error": "Failed to fetch account data"
}
```

## Status Codes

- **200 OK**: Successfully returns user profile data
- **404 Not Found**: User account doesn't exist
- **500 Internal Server Error**: Database or external service error

## Data Fields Explained

- **reputation**: Hive reputation score (raw format)
- **community_followers**: Followers within hive-173115 community
- **community_followings**: Following within hive-173115 community
- **community_totalposts**: Posts tagged with hive-173115
- **vp_percent**: Voting power percentage
- **rc_percent**: Resource credits percentage
- **reward\_\***: Pending reward balances

## Caching

- Response is cached for 300 seconds (5 minutes)
- Includes `stale-while-revalidate=150` for background updates

## Use Cases

- Display user profile information
- Check user statistics and activity
- Monitor voting power and resource credits
- Community-specific analytics
- User verification and validation

## Rate Limiting

- Standard API rate limits apply
- Cached responses help reduce database load

## Dependencies

- HAFSQL Database connection
- HiveClient for RC/VP data
- hive-173115 community data
