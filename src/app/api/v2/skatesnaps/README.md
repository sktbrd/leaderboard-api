# V2 SkateSnaps API

## Endpoints Overview

### General SkateSnaps

`GET /api/v2/skatesnaps`

### User-Specific SkateSnaps

`GET /api/v2/skatesnaps/{username}`

### Trending SkateSnaps

`GET /api/v2/skatesnaps/trending`

## Description

SkateSnaps are short-form skateboarding content posts - quick videos, photos, and updates from the Skatehive community. These endpoints provide access to skateboarding-focused microcontent from the hive-173115 community.

## Request Examples

### General SkateSnaps

```bash
curl -X GET "http://localhost:3000/api/v2/skatesnaps"
curl -X GET "http://localhost:3000/api/v2/skatesnaps?page=1&limit=20&type=video"
```

### User SkateSnaps

```bash
curl -X GET "http://localhost:3000/api/v2/skatesnaps/xvlad"
curl -X GET "http://localhost:3000/api/v2/skatesnaps/gnars?page=1&limit=10"
```

### Trending SkateSnaps

```bash
curl -X GET "http://localhost:3000/api/v2/skatesnaps/trending"
curl -X GET "http://localhost:3000/api/v2/skatesnaps/trending?timeframe=week"
```

## Query Parameters

### Pagination (Optional)

- **page** (integer): Page number, default: 1, minimum: 1
- **limit** (integer): Items per page, default: 20, minimum: 1, maximum: 50

### Content Filtering (Optional)

- **type** (string): Content type - "video", "image", "text", "all" (default: "all")
- **tag** (string): Additional tag filtering (e.g., "street", "vert", "park")
- **timeframe** (string): For trending - "day", "week", "month" (default: "week")

### User-Specific Parameters

- **username** (path parameter): Hive username for user-specific SkateSnaps

## Response Format

### Successful Response

```json
{
  "success": true,
  "data": [
    {
      "id": "skatesnap_123",
      "author": "xvlad",
      "authorDisplayName": "Vlad Skates",
      "authorAvatar": "https://example.com/avatar.jpg",
      "content": {
        "text": "Just landed my first kickflip! 🛹 #skatehive #progress",
        "media": [
          {
            "type": "video",
            "url": "https://example.com/video.mp4",
            "thumbnail": "https://example.com/thumb.jpg",
            "duration": 15
          }
        ],
        "location": {
          "name": "Venice Skate Park",
          "coordinates": [34.0522, -118.2437]
        }
      },
      "metadata": {
        "created": "2024-01-15T14:30:00.000Z",
        "updated": "2024-01-15T14:30:00.000Z",
        "tags": ["hive-173115", "skatehive", "kickflip", "progress"],
        "community": "hive-173115"
      },
      "engagement": {
        "upvotes": 24,
        "downvotes": 1,
        "comments": 8,
        "shares": 3,
        "views": 156
      },
      "rewards": {
        "pending": "2.45 HBD",
        "paid": "0.00 HBD",
        "payoutTime": "2024-01-22T14:30:00.000Z"
      }
    },
    {
      "id": "skatesnap_124",
      "author": "steemskate",
      "authorDisplayName": "SteemSkate",
      "authorAvatar": "https://example.com/avatar2.jpg",
      "content": {
        "text": "Morning session at the local park 🌅",
        "media": [
          {
            "type": "image",
            "url": "https://example.com/image.jpg",
            "caption": "Perfect lighting for skating"
          }
        ]
      },
      "metadata": {
        "created": "2024-01-15T08:15:00.000Z",
        "updated": "2024-01-15T08:15:00.000Z",
        "tags": ["hive-173115", "skatehive", "morning", "park"],
        "community": "hive-173115"
      },
      "engagement": {
        "upvotes": 18,
        "downvotes": 0,
        "comments": 5,
        "shares": 2,
        "views": 89
      },
      "rewards": {
        "pending": "1.23 HBD",
        "paid": "0.00 HBD",
        "payoutTime": "2024-01-22T08:15:00.000Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 324,
    "hasNext": true,
    "hasPrev": false
  },
  "metadata": {
    "contentType": "all",
    "timeframe": "week",
    "lastUpdated": "2024-01-15T15:00:00.000Z"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Failed to fetch SkateSnaps" | "User not found" | "Invalid parameters"
}
```

## Status Codes

- **200 OK**: Successfully returns SkateSnaps data
- **400 Bad Request**: Invalid query parameters
- **404 Not Found**: User not found (user-specific endpoints)
- **500 Internal Server Error**: Database or processing error

## Content Types

### Video SkateSnaps

- **Duration**: Typically 15-60 seconds
- **Formats**: MP4, WebM optimized for mobile
- **Features**: Thumbnails, duration info, quality options

### Image SkateSnaps

- **Formats**: JPEG, PNG, WebP
- **Sizes**: Optimized for mobile and web viewing
- **Features**: Captions, alt text for accessibility

### Text SkateSnaps

- **Length**: Up to 280 characters (Twitter-style)
- **Features**: Hashtag support, mentions, emoji
- **Rich Content**: Links, media embeds

## Trending Algorithm

### Engagement Score Calculation

1. **Recent Activity** (50%):

   - Upvotes in last 24h: 10 points each
   - Comments in last 24h: 15 points each
   - Shares in last 24h: 20 points each

2. **Velocity** (30%):

   - Rate of engagement increase
   - Time since publication
   - Peak engagement timing

3. **Quality Signals** (20%):
   - Author reputation
   - Content completeness (media + text)
   - Community interaction depth

### Time Decay

- 0-6 hours: 100% weight
- 6-24 hours: 80% weight
- 1-3 days: 50% weight
- 3+ days: 20% weight

## Caching Strategy

- **General SkateSnaps**: 5 minutes cache
- **User SkateSnaps**: 10 minutes cache per user
- **Trending**: 15 minutes cache (heavier computation)

## Use Cases

- **Mobile Feed**: Quick scrollable skateboarding content
- **Discovery**: Find new skaters and content
- **Engagement**: Like, comment, share skate content
- **User Profiles**: Show user's skateboarding journey
- **Community Building**: Connect skaters worldwide

## Content Moderation

- **Community Guidelines**: Skateboarding-focused content only
- **Quality Control**: Spam detection and filtering
- **Safety**: Appropriate content warnings for dangerous tricks
- **Tagging**: Automatic tag suggestions and validation

## Media Handling

- **Upload Limits**: Videos max 100MB, images max 10MB
- **Processing**: Automatic compression and optimization
- **CDN**: Global delivery for fast loading
- **Backup**: Multiple copies for reliability

## Performance Notes

- Media-heavy content requires efficient loading
- Implement lazy loading for better UX
- Consider different quality options for various connections
- Trending calculations may have higher latency

## Dependencies

- **HAFSQL Database**: Hive blockchain data and posts
- **Media Storage**: IPFS or centralized CDN
- **Community Filter**: hive-173115 tag validation
- **User System**: Authentication and profiles

## Rate Limiting

- Standard API rate limits apply
- Media endpoint may have separate limits
- Consider user-based rate limiting for quality content

## Data Sources

- **Hive Blockchain**: Post content and metadata
- **Media Files**: IPFS or storage service
- **Engagement Data**: Votes, comments, shares from blockchain
- **User Profiles**: Display names, avatars, reputation
- **Location Data**: Optional GPS coordinates for skate spots

## Integration Notes

- **Mobile Apps**: Optimized for vertical scrolling feeds
- **Web Platform**: Responsive design for desktop and mobile
- **Social Sharing**: Easy sharing to other platforms
- **Notifications**: Real-time engagement updates
- **Analytics**: Track popular content and user behavior
