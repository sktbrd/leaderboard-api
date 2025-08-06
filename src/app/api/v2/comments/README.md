# V2 Comments API

## Endpoints Overview

### Get Comments

`GET /api/v2/comments`

### Create Comment

`POST /api/v2/comments`

## Description

Comments API provides access to community discussions and interactions. Users can retrieve existing comments and create new ones on posts within the Skatehive community (hive-173115).

## GET /api/v2/comments

### Request Examples

```bash
# Get all recent comments
curl -X GET "http://localhost:3000/api/v2/comments"

# Get comments with pagination
curl -X GET "http://localhost:3000/api/v2/comments?page=1&limit=20"

# Get comments for a specific post
curl -X GET "http://localhost:3000/api/v2/comments?postId=skatehive-post-123"

# Get comments by a specific user
curl -X GET "http://localhost:3000/api/v2/comments?author=xvlad"
```

### Query Parameters (Optional)

- **page** (integer): Page number, default: 1, minimum: 1
- **limit** (integer): Items per page, default: 25, minimum: 1, maximum: 100
- **postId** (string): Filter comments for a specific post
- **author** (string): Filter comments by author username
- **sortBy** (string): Sort field - "created", "updated", "votes" (default: "created")
- **order** (string): Sort order - "asc" or "desc" (default: "desc")
- **timeframe** (string): Time filter - "day", "week", "month", "all" (default: "all")

### Response Format

```json
{
  "success": true,
  "data": [
    {
      "id": "comment_abc123",
      "postId": "skatehive-post-456",
      "parentId": null,
      "author": "xvlad",
      "authorDisplayName": "Vlad Skates",
      "authorAvatar": "https://example.com/avatar.jpg",
      "authorReputation": 65.43,
      "content": {
        "body": "Great trick! I've been working on kickflips too. Any tips for getting the rotation consistent?",
        "markdown": "Great trick! I've been working on kickflips too. Any tips for getting the rotation consistent?",
        "mentions": ["gnars", "steemskate"],
        "hashtags": ["skatehive", "tricks"]
      },
      "metadata": {
        "created": "2024-01-15T14:30:00.000Z",
        "updated": "2024-01-15T14:30:00.000Z",
        "edited": false,
        "depth": 0,
        "isReply": false
      },
      "engagement": {
        "upvotes": 12,
        "downvotes": 0,
        "netVotes": 12,
        "replies": 3,
        "totalChildren": 5
      },
      "rewards": {
        "pending": "0.45 HBD",
        "paid": "0.00 HBD",
        "payoutTime": "2024-01-22T14:30:00.000Z"
      },
      "post": {
        "title": "Finally landed my first kickflip!",
        "author": "steemskate",
        "permalink": "@steemskate/first-kickflip"
      }
    },
    {
      "id": "comment_def456",
      "postId": "skatehive-post-456",
      "parentId": "comment_abc123",
      "author": "gnars",
      "authorDisplayName": "Gnars DAO",
      "authorAvatar": "https://example.com/gnars-avatar.jpg",
      "authorReputation": 72.48,
      "content": {
        "body": "@xvlad Practice the flick motion without the board first. Focus on the ankle snap!",
        "markdown": "@xvlad Practice the flick motion without the board first. Focus on the ankle snap!",
        "mentions": ["xvlad"],
        "hashtags": []
      },
      "metadata": {
        "created": "2024-01-15T15:45:00.000Z",
        "updated": "2024-01-15T15:45:00.000Z",
        "edited": false,
        "depth": 1,
        "isReply": true
      },
      "engagement": {
        "upvotes": 8,
        "downvotes": 0,
        "netVotes": 8,
        "replies": 1,
        "totalChildren": 1
      },
      "rewards": {
        "pending": "0.23 HBD",
        "paid": "0.00 HBD",
        "payoutTime": "2024-01-22T15:45:00.000Z"
      },
      "post": {
        "title": "Finally landed my first kickflip!",
        "author": "steemskate",
        "permalink": "@steemskate/first-kickflip"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 156,
    "hasNext": true,
    "hasPrev": false
  },
  "metadata": {
    "sortBy": "created",
    "order": "desc",
    "timeframe": "all",
    "lastUpdated": "2024-01-15T16:00:00.000Z"
  }
}
```

## POST /api/v2/comments

### Request Examples

```bash
# Create a new comment
curl -X POST "http://localhost:3000/api/v2/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "postId": "skatehive-post-456",
    "body": "Awesome progress! Keep it up 🛹",
    "author": "xvlad"
  }'

# Reply to an existing comment
curl -X POST "http://localhost:3000/api/v2/comments" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "postId": "skatehive-post-456",
    "parentId": "comment_abc123",
    "body": "Thanks for the tip! I'll try that.",
    "author": "xvlad"
  }'
```

### Request Body

```json
{
  "postId": "skatehive-post-456",
  "parentId": "comment_abc123",
  "body": "Your comment text here...",
  "author": "username",
  "tags": ["skatehive", "hive-173115"]
}
```

### Required Fields

- **postId** (string): ID of the post to comment on
- **body** (string): Comment content (max 8192 characters)
- **author** (string): Username of the comment author

### Optional Fields

- **parentId** (string): ID of parent comment (for replies)
- **tags** (array): Additional tags (auto-adds hive-173115)
- **mentions** (array): Users to mention in the comment

### Response Format

```json
{
  "success": true,
  "data": {
    "id": "comment_new789",
    "postId": "skatehive-post-456",
    "parentId": "comment_abc123",
    "author": "xvlad",
    "body": "Thanks for the tip! I'll try that.",
    "created": "2024-01-15T16:30:00.000Z",
    "transactionId": "abc123def456",
    "permalink": "@xvlad/re-steemskate-first-kickflip-20240115t163000000z"
  },
  "message": "Comment created successfully"
}
```

## Status Codes

- **200 OK**: Successfully retrieved comments (GET)
- **201 Created**: Comment successfully created (POST)
- **400 Bad Request**: Invalid parameters or missing required fields
- **401 Unauthorized**: Authentication required (POST)
- **404 Not Found**: Post or parent comment not found
- **413 Payload Too Large**: Comment body exceeds character limit
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Database or blockchain error

## Comment Threading

### Depth Levels

- **Level 0**: Top-level comments on posts
- **Level 1**: Replies to top-level comments
- **Level 2+**: Nested replies (up to 10 levels deep)

### Threading Rules

- Comments inherit community tags from parent post
- Reply notifications sent to parent comment author
- Voting power affects comment visibility
- Deep nested comments may have reduced visibility

## Content Guidelines

### Allowed Content

- Skateboarding-related discussions
- Constructive feedback and tips
- Community encouragement and support
- Technical trick discussions

### Prohibited Content

- Spam or repetitive content
- Off-topic discussions
- Harmful or offensive language
- Self-promotion without value

## Engagement Features

### Voting

- Comments can receive upvotes and downvotes
- Vote weight affects comment ranking
- Author reputation influences vote impact

### Mentions

- Use @username to mention users
- Mentioned users receive notifications
- Auto-linking to user profiles

### Rewards

- Comments earn HBD rewards like posts
- 7-day payout period
- Rewards split between author and curators

## Performance Notes

- Comments load with pagination for better performance
- Deep comment trees may require additional API calls
- Consider implementing lazy loading for nested comments
- Cache comment counts for faster post loading

## Caching Strategy

- **Comment Lists**: 2 minutes cache
- **Individual Comments**: 5 minutes cache
- **Comment Counts**: 1 minute cache
- **User Comments**: 10 minutes cache per user

## Rate Limiting

- **GET Requests**: Standard API limits (1000/hour)
- **POST Requests**: 60 comments per hour per user
- **Reply Limit**: 10 replies per minute to prevent spam
- **Content Limit**: 10 comments per post per hour per user

## Dependencies

- **HAFSQL Database**: Comment data and threading
- **HiveClient**: Blockchain interaction for posting
- **Authentication**: User verification for POST requests
- **Reputation System**: Author reputation scoring

## Use Cases

- **Post Discussions**: Enable community conversations
- **User Engagement**: Track user participation and activity
- **Content Moderation**: Monitor and manage community discussions
- **Mobile Apps**: Threaded comment interface
- **Notifications**: Real-time comment and mention alerts

## Data Sources

- **Hive Blockchain**: All comment data and metadata
- **Community Posts**: hive-173115 tagged content
- **User Profiles**: Author information and reputation
- **Voting Data**: Upvotes, downvotes, and rewards
- **Social Graph**: Following relationships for notifications

## Integration Notes

- **Real-time Updates**: Consider WebSocket for live comments
- **Mobile Optimization**: Efficient loading and threading
- **Accessibility**: Screen reader support for comment threads
- **Moderation Tools**: Admin interface for comment management
- **Analytics**: Track comment engagement and popular discussions
