# V2 Feed Endpoints

## Endpoints Overview

### General Feed

`GET /api/v2/feed`

### User-Specific Feed

`GET /api/v2/feed/{username}`

### Trending Feed

`GET /api/v2/feed/trending`

## Description

Feed endpoints provide access to Skatehive community content including posts, updates, and trending content from the hive-173115 community.

## Request Examples

### General Feed

```bash
curl -X GET "http://localhost:3000/api/v2/feed"
curl -X GET "http://localhost:3000/api/v2/feed?page=1&limit=10"
```

### User Feed

```bash
curl -X GET "http://localhost:3000/api/v2/feed/xvlad?username=xvlad"
curl -X GET "http://localhost:3000/api/v2/feed/xvlad?username=xvlad&page=1&limit=5"
```

### Trending Feed

```bash
curl -X GET "http://localhost:3000/api/v2/feed/trending"
curl -X GET "http://localhost:3000/api/v2/feed/trending?page=1&limit=20"
```

## Query Parameters

### Pagination Parameters (Optional)

- **page** (integer): Page number, default: 1, minimum: 1
- **limit** (integer): Items per page, default: 25, minimum: 1, maximum: 100

### User Feed Parameters

- **username** (query parameter, required for user feeds): Hive username

## Response Format

### Successful Response

```json
{
  "success": true,
  "data": [
    {
      "id": "post_id",
      "author": "username",
      "title": "Post Title",
      "body": "Post content...",
      "created": "2024-01-01T00:00:00.000Z",
      "updated": "2024-01-01T00:00:00.000Z",
      "category": "skateboarding",
      "tags": ["hive-173115", "skatehive", "skateboarding"],
      "upvotes": 25,
      "downvotes": 1,
      "comments": 8,
      "payout": "5.234 HBD",
      "author_reputation": 65.43,
      "images": ["https://example.com/image1.jpg"],
      "community": "hive-173115"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 150,
    "hasNext": true,
    "hasPrev": false
  },
  "headers": {}
}
```

### Error Response

```json
{
  "success": false,
  "error": "Failed to fetch feed data" | "Invalid parameters"
}
```

## Status Codes

- **200 OK**: Successfully returns feed data
- **400 Bad Request**: Invalid pagination parameters
- **404 Not Found**: User not found (user-specific feeds)
- **500 Internal Server Error**: Database or blockchain query failed

## Content Filtering

- **Community Filter**: Only shows content from hive-173115 community
- **Content Type**: Includes posts, videos, images related to skateboarding
- **Quality Filter**: May include reputation-based filtering

## Caching Strategy

- **General Feed**: Cached for 5 minutes
- **User Feed**: Cached for 5 minutes per user
- **Trending**: Cached for 10 minutes (updates less frequently)

## Use Cases

- **Main Feed**: Display latest community content
- **User Profiles**: Show user's posts and activity
- **Discovery**: Find trending skateboarding content
- **Mobile Apps**: Paginated content loading
- **Analytics**: Track popular content and engagement

## Performance Notes

- Use pagination to avoid large response payloads
- Trending calculation may have higher latency
- Consider caching on client side for better UX

## Dependencies

- **HAFSQL Database**: Hive blockchain data
- **Community Filters**: hive-173115 tag filtering
- **Reputation System**: Hive reputation scoring

## Rate Limiting

- Standard API rate limits apply
- Cached responses reduce database load
- Recommended: Implement client-side caching

## Data Sources

- **Hive Blockchain**: Post content and metadata
- **Community Tags**: hive-173115 filtering
- **Engagement Metrics**: Votes, comments, shares
- **Author Data**: Reputation and profile information
