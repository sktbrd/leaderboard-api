# Highest Paid Posts Endpoint

This endpoint provides access to the highest paid posts ever from the SkateHive community (hive-173115).

## Endpoint

`GET /api/v2/highest-paid`

## Query Parameters

| Parameter   | Type   | Default      | Description                                      |
| ----------- | ------ | ------------ | ------------------------------------------------ |
| `page`      | number | 1            | Page number for pagination                       |
| `limit`     | number | 25           | Posts per page (max: 100)                        |
| `community` | string | hive-173115  | Community code to filter by                      |
| `minPayout` | number | 0            | Minimum total payout filter (in USD/HBD)         |
| `author`    | string | -            | Filter posts by author (partial match supported) |

## Response Format

```json
{
  "posts": [
    {
      "author": "username",
      "permlink": "post-permlink",
      "title": "Post Title",
      "body": "Truncated body content...",
      "created": "2024-01-15T10:30:00.000Z",
      "total_payout": 150.25,
      "pending_payout": 0,
      "author_rewards": 75.12,
      "curator_payout": 75.13,
      "total_votes": 245,
      "json_metadata": "{}",
      "url": "/@username/post-permlink",
      "thumbnail": "https://..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 5420,
    "totalPages": 217,
    "hasNext": true,
    "hasPrev": false
  },
  "cacheInfo": {
    "source": "global",
    "lastUpdated": "2024-01-15T10:00:00.000Z",
    "executionTimeMs": 45
  },
  "filters": {
    "community": "hive-173115",
    "minPayout": null,
    "author": null
  }
}
```

## Caching Strategy

The endpoint uses a multi-level caching strategy:

1. **Global Cache**: Updated by the cron job every 10-30 minutes with the top 500 highest paid posts
2. **Local Cache**: Per-request cache with 5-minute TTL for paginated queries
3. **CDN Cache**: 5-minute cache with stale-while-revalidate

## Cron Job

The cache is updated by calling:

```
GET /api/cron/highest-paid
```

### Vercel Cron Configuration

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/highest-paid",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

This runs the cache update every 15 minutes.

## Examples

### Get top 10 highest paid posts

```bash
curl "https://api.skatehive.app/api/v2/highest-paid?limit=10"
```

### Get posts with minimum $50 payout

```bash
curl "https://api.skatehive.app/api/v2/highest-paid?minPayout=50"
```

### Get highest paid posts by specific author

```bash
curl "https://api.skatehive.app/api/v2/highest-paid?author=xvlad"
```

### Paginated results

```bash
curl "https://api.skatehive.app/api/v2/highest-paid?page=2&limit=50"
```

## Ranking Algorithm

Posts are ranked by total payout, calculated as:

```
total_payout = author_rewards + total_payout_value + curator_payout_value + pending_payout_value
```

This includes:
- **Author rewards**: HBD/HIVE received by the post author
- **Curator payout**: Rewards distributed to voters
- **Pending payout**: Any rewards still in the payout window (7 days)
