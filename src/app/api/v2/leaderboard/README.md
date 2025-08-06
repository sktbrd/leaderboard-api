# V2 Leaderboard API

## Endpoint

`GET /api/v2/leaderboard`

## Description

Provides leaderboard data for the Skatehive community, ranking users by various metrics including engagement, content creation, and community participation.

## Request Examples

```bash
# Basic leaderboard request
curl -X GET "http://localhost:3000/api/v2/leaderboard"

# With pagination
curl -X GET "http://localhost:3000/api/v2/leaderboard?page=1&limit=20"

# With sorting options
curl -X GET "http://localhost:3000/api/v2/leaderboard?sortBy=score&order=desc"
```

## Query Parameters

### Pagination (Optional)

- **page** (integer): Page number, default: 1, minimum: 1
- **limit** (integer): Items per page, default: 25, minimum: 1, maximum: 100

### Sorting (Optional)

- **sortBy** (string): Sort field - "score", "posts", "engagement", "reputation"
- **order** (string): Sort order - "asc" or "desc", default: "desc"

### Filters (Optional)

- **timeframe** (string): "week", "month", "all" - default: "all"
- **community** (string): Community filter, default: "hive-173115"

## Response Format

### Successful Response

```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "username": "gnars",
      "displayName": "Gnars DAO",
      "profileImage": "https://example.com/avatar.jpg",
      "score": 2847.5,
      "metrics": {
        "postsCount": 156,
        "commentsCount": 423,
        "votesGiven": 1200,
        "votesReceived": 892,
        "totalPayout": "245.67 HBD",
        "followers": 1205,
        "reputation": 72.48
      },
      "badges": ["founder", "top-creator", "community-leader"],
      "lastActive": "2024-01-15T14:30:00.000Z",
      "joinDate": "2021-03-15T00:00:00.000Z"
    },
    {
      "rank": 2,
      "username": "steemskate",
      "displayName": "SteemSkate",
      "profileImage": "https://example.com/avatar2.jpg",
      "score": 2156.8,
      "metrics": {
        "postsCount": 89,
        "commentsCount": 312,
        "votesGiven": 890,
        "votesReceived": 645,
        "totalPayout": "178.23 HBD",
        "followers": 854,
        "reputation": 69.12
      },
      "badges": ["og-skater", "content-creator"],
      "lastActive": "2024-01-15T12:15:00.000Z",
      "joinDate": "2021-04-20T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 150,
    "hasNext": true,
    "hasPrev": false
  },
  "metadata": {
    "lastUpdated": "2024-01-15T15:00:00.000Z",
    "timeframe": "all",
    "community": "hive-173115"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Failed to fetch leaderboard data",
  "details": "Database connection error"
}
```

## Status Codes

- **200 OK**: Successfully returns leaderboard data
- **400 Bad Request**: Invalid query parameters
- **500 Internal Server Error**: Database query failed or data processing error

## Scoring Algorithm

### Score Calculation Components

1. **Content Creation** (40%):

   - Posts published: 10 points each
   - Comments made: 2 points each
   - Post quality score based on engagement

2. **Community Engagement** (35%):

   - Votes given: 1 point each
   - Comments received: 3 points each
   - Vote weight received: Variable

3. **Social Impact** (15%):

   - Followers count: 0.5 points each
   - Being followed by top users: Bonus points
   - Community mentions: 5 points each

4. **Reputation** (10%):
   - Hive reputation score
   - Account age bonus
   - Consistency factor (regular posting)

### Time Decay

- Recent activity (7 days): 100% weight
- Activity 8-30 days: 80% weight
- Activity 31-90 days: 50% weight
- Activity 90+ days: 20% weight

## Caching

- **Cache Duration**: 15 minutes
- **Update Frequency**: Every hour via cron job
- **Invalidation**: Manual refresh available via cron endpoint

## Use Cases

- **Community Ranking**: Display top contributors
- **Gamification**: Show user progress and achievements
- **Recognition**: Highlight community leaders
- **Analytics**: Track community growth and engagement
- **Rewards**: Basis for token distribution or privileges

## Performance Notes

- Leaderboard calculations are computationally expensive
- Data is pre-computed and cached for performance
- Large communities may require pagination
- Consider implementing real-time rank updates for top users

## Dependencies

- **HAFSQL Database**: Hive blockchain data and user activities
- **Community Data**: hive-173115 community posts and interactions
- **User Profiles**: Avatar images and display names
- **Reputation System**: Hive reputation algorithm

## Rate Limiting

- Standard API rate limits apply
- Cached responses reduce database load
- Consider implementing tiered caching for different user levels

## Data Sources

- **Hive Blockchain**: All user activities and interactions
- **Community Posts**: hive-173115 tagged content
- **Voting Data**: Upvotes, downvotes, vote weights
- **Social Graph**: Followers, following relationships
- **Engagement Metrics**: Comments, shares, mentions

## Badge System

- **founder**: Community founders and early contributors
- **top-creator**: Consistently high-quality content creators
- **community-leader**: Users with high engagement and leadership
- **og-skater**: Original skateboarding community members
- **content-creator**: Users focused on content production
- **curator**: Users who excel at content curation and voting

## Maintenance

- **Daily Updates**: Score recalculation via cron job
- **Weekly Rebalancing**: Algorithm tuning and badge assignment
- **Monthly Reports**: Community growth and leaderboard analytics
- **Data Cleanup**: Remove inactive users and outdated data
