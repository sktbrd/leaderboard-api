export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Skatehive Leaderboard API',
    version: '2.0.0',
    description: 'Complete API documentation for Skatehive Leaderboard with V1 and V2 endpoints',
  },
  tags: [
    {
      name: 'V1 Legacy',
      description: 'Legacy V1 API endpoints'
    },
    {
      name: 'V2 Core',
      description: 'V2 Core API endpoints - main functionality'
    },
    {
      name: 'V2 Feed',
      description: 'V2 Feed endpoints - content feeds and posts'
    },
    {
      name: 'V2 Social',
      description: 'V2 Social endpoints - followers, following, profiles'
    },
    {
      name: 'V2 Wallet',
      description: 'V2 Wallet endpoints - balances and financial data'
    },
    {
      name: 'V2 SkateSnaps',
      description: 'V2 SkateSnaps endpoints - short-form content'
    },
    {
      name: 'V2 Utilities',
      description: 'V2 Utility endpoints - voting, comments, spots'
    }
  ],
  paths: {
    // V1 Legacy Endpoints
    '/api/skatehive': {
      get: {
        tags: ['V1 Legacy'],
        summary: 'Fetch leaderboard data from Supabase',
        responses: {
          200: { description: 'Leaderboard data' },
          500: { description: 'Failed to fetch data' },
        },
      },
    },
    '/api/ethHelpers': {
      get: {
        tags: ['V1 Legacy'],
        summary: 'Get Ethereum-related data',
        parameters: [
          {
            in: 'query',
            name: 'address',
            required: true,
            schema: { type: 'string' },
            description: 'Ethereum wallet address'
          },
          {
            in: 'query',
            name: 'method',
            required: true,
            schema: {
              type: 'string',
              enum: ['balance', 'votes', 'skatehiveNFTBalance'],
            },
            description: 'Method to call (balance, votes, or skatehiveNFTBalance)'
          },
        ],
        responses: {
          200: { description: 'Result of requested method' },
          400: { description: 'Invalid parameters' },
          500: { description: 'Failed to fetch data' },
        },
      },
    },
    '/api/leaderboard': {
      get: {
        tags: ['V1 Legacy'],
        summary: 'Fetch and store leaderboard data',
        parameters: [
          {
            in: 'query',
            name: 'community',
            required: false,
            schema: { type: 'string' },
            description: 'Community name to filter by'
          },
        ],
        responses: {
          200: { description: 'Data fetched and stored successfully' },
          500: { description: 'Error in API route' },
        },
      },
      post: {
        tags: ['V1 Legacy'],
        summary: 'Fetch and store leaderboard data for a community',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  community: { type: 'string' },
                },
                required: ['community'],
              },
            },
          },
        },
        responses: {
          200: { description: 'Data fetched and stored successfully' },
          400: { description: 'Community parameter is missing' },
          500: { description: 'Error in API route' },
        },
      },
    },
    '/api/cron/update': {
      get: {
        tags: ['V1 Legacy'],
        summary: 'Execute cron job to update data',
        responses: {
          200: { description: 'Cron job executed successfully' },
          500: { description: 'Failed to execute cron job' },
        },
      },
    },

    // V2 Core Endpoints
    '/api/v2': {
      get: {
        tags: ['V2 Core'],
        summary: 'V2 API root - lists all available V2 endpoints',
        responses: {
          200: { 
            description: 'List of available V2 endpoints',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    message: { type: 'string' },
                    endpoints: { type: 'object' }
                  }
                }
              }
            }
          },
        },
      },
    },
    '/api/v2/leaderboard': {
      get: {
        tags: ['V2 Core'],
        summary: 'Get V2 leaderboard data with caching',
        responses: {
          200: { 
            description: 'Leaderboard data with cache headers',
            headers: {
              'Cache-Control': {
                description: 'Cache control header',
                schema: { type: 'string' }
              }
            }
          },
          500: { description: 'Failed to fetch leaderboard data' },
        },
      },
    },

    // V2 Feed Endpoints
    '/api/v2/feed': {
      get: {
        tags: ['V2 Feed'],
        summary: 'Get main community feed with pagination',
        parameters: [
          {
            in: 'query',
            name: 'page',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 },
            description: 'Page number for pagination'
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
            description: 'Number of posts per page'
          }
        ],
        responses: {
          200: { 
            description: 'Community feed data with pagination',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    total: { type: 'integer' },
                    rows: { type: 'array' }
                  }
                }
              }
            }
          },
          500: { description: 'Failed to fetch feed data' },
        },
      },
    },
    '/api/v2/feed/trending': {
      get: {
        tags: ['V2 Feed'],
        summary: 'Get trending community feed',
        parameters: [
          {
            in: 'query',
            name: 'page',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 }
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 }
          }
        ],
        responses: {
          200: { description: 'Trending feed data' },
          500: { description: 'Failed to fetch trending feed' },
        },
      },
    },
    '/api/v2/feed/{username}': {
      get: {
        tags: ['V2 Feed'],
        summary: 'Get user-specific feed',
        parameters: [
          {
            in: 'path',
            name: 'username',
            required: true,
            schema: { type: 'string' },
            description: 'Hive username'
          },
          {
            in: 'query',
            name: 'page',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 }
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 }
          }
        ],
        responses: {
          200: { description: 'User feed data' },
          404: { description: 'User not found' },
          500: { description: 'Failed to fetch user feed' },
        },
      },
    },

    // V2 Social Endpoints
    '/api/v2/profile': {
      get: {
        tags: ['V2 Social'],
        summary: 'Get user profile information',
        parameters: [
          {
            in: 'query',
            name: 'username',
            required: false,
            schema: { type: 'string', default: 'SPECTATOR' },
            description: 'Hive username to get profile for'
          }
        ],
        responses: {
          200: { 
            description: 'User profile data including reputation, metadata, and stats',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    reputation: { type: 'number' },
                    json_metadata: { type: 'object' },
                    posting_metadata: { type: 'object' }
                  }
                }
              }
            }
          },
          500: { description: 'Failed to fetch profile data' },
        },
      },
    },
    '/api/v2/profile/{username}': {
      get: {
        tags: ['V2 Social'],
        summary: 'Get specific user profile by username path',
        parameters: [
          {
            in: 'path',
            name: 'username',
            required: true,
            schema: { type: 'string' },
            description: 'Hive username'
          }
        ],
        responses: {
          200: { description: 'User profile data' },
          404: { description: 'User not found' },
          500: { description: 'Failed to fetch profile data' },
        },
      },
    },
    '/api/v2/followers/{username}': {
      get: {
        tags: ['V2 Social'],
        summary: 'Get user followers list',
        parameters: [
          {
            in: 'path',
            name: 'username',
            required: true,
            schema: { type: 'string' },
            description: 'Hive username'
          },
          {
            in: 'query',
            name: 'page',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 }
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 }
          }
        ],
        responses: {
          200: { description: 'List of user followers' },
          404: { description: 'User not found' },
          500: { description: 'Failed to fetch followers' },
        },
      },
    },
    '/api/v2/following/{username}': {
      get: {
        tags: ['V2 Social'],
        summary: 'Get user following list',
        parameters: [
          {
            in: 'path',
            name: 'username',
            required: true,
            schema: { type: 'string' },
            description: 'Hive username'
          },
          {
            in: 'query',
            name: 'page',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 }
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 }
          }
        ],
        responses: {
          200: { description: 'List of users being followed' },
          404: { description: 'User not found' },
          500: { description: 'Failed to fetch following list' },
        },
      },
    },

    // V2 Wallet Endpoints
    '/api/v2/balance/{username}': {
      get: {
        tags: ['V2 Wallet'],
        summary: 'Get user wallet balance information',
        parameters: [
          {
            in: 'query',
            name: 'username',
            required: true,
            schema: { type: 'string' },
            description: 'Hive username'
          }
        ],
        responses: {
          200: { 
            description: 'User balance data including HIVE, HBD, HP, and savings',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    account_name: { type: 'string' },
                    hive: { type: 'number' },
                    hbd: { type: 'number' },
                    vests: { type: 'number' },
                    hp_equivalent: { type: 'number' },
                    hive_savings: { type: 'number' },
                    hbd_savings: { type: 'number' }
                  }
                }
              }
            }
          },
          404: { description: 'User balance not found' },
          500: { description: 'Failed to fetch balance data' },
        },
      },
    },
    '/api/v2/market': {
      get: {
        tags: ['V2 Wallet'],
        summary: 'Get Hive market data and prices',
        responses: {
          200: { 
            description: 'Market data including HIVE/HBD prices and trading info'
          },
          500: { description: 'Failed to fetch market data' },
        },
      },
    },

    // V2 SkateSnaps Endpoints
    '/api/v2/skatesnaps': {
      get: {
        tags: ['V2 SkateSnaps'],
        summary: 'Get latest skate snaps feed',
        parameters: [
          {
            in: 'query',
            name: 'page',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 },
            description: 'Page number for pagination'
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 },
            description: 'Number of snaps per page'
          }
        ],
        responses: {
          200: { description: 'Latest skate snaps feed data' },
          500: { description: 'Failed to fetch skate snaps' },
        },
      },
    },
    '/api/v2/skatesnaps/trending': {
      get: {
        tags: ['V2 SkateSnaps'],
        summary: 'Get trending skate snaps',
        parameters: [
          {
            in: 'query',
            name: 'page',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 }
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 }
          }
        ],
        responses: {
          200: { description: 'Trending skate snaps data' },
          500: { description: 'Failed to fetch trending snaps' },
        },
      },
    },
    '/api/v2/skatesnaps/{username}': {
      get: {
        tags: ['V2 SkateSnaps'],
        summary: 'Get user-specific skate snaps',
        parameters: [
          {
            in: 'path',
            name: 'username',
            required: true,
            schema: { type: 'string' },
            description: 'Hive username'
          },
          {
            in: 'query',
            name: 'page',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 }
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 }
          }
        ],
        responses: {
          200: { description: 'User skate snaps data' },
          404: { description: 'User not found' },
          500: { description: 'Failed to fetch user snaps' },
        },
      },
    },

    // V2 Utility Endpoints
    '/api/v2/comments': {
      get: {
        tags: ['V2 Utilities'],
        summary: 'Get comments data',
        parameters: [
          {
            in: 'query',
            name: 'author',
            required: false,
            schema: { type: 'string' },
            description: 'Filter by comment author'
          },
          {
            in: 'query',
            name: 'permlink',
            required: false,
            schema: { type: 'string' },
            description: 'Filter by parent post permlink'
          }
        ],
        responses: {
          200: { description: 'Comments data' },
          500: { description: 'Failed to fetch comments' },
        },
      },
      post: {
        tags: ['V2 Utilities'],
        summary: 'Create a new comment',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  author: { type: 'string' },
                  permlink: { type: 'string' },
                  body: { type: 'string' },
                  parent_author: { type: 'string' },
                  parent_permlink: { type: 'string' }
                },
                required: ['author', 'permlink', 'body']
              }
            }
          }
        },
        responses: {
          200: { description: 'Comment created successfully' },
          400: { description: 'Invalid comment data' },
          500: { description: 'Failed to create comment' },
        },
      },
    },
    '/api/v2/vote': {
      post: {
        tags: ['V2 Utilities'],
        summary: 'Submit a vote on a post or comment',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  voter: { type: 'string' },
                  author: { type: 'string' },
                  permlink: { type: 'string' },
                  weight: { type: 'integer', minimum: -10000, maximum: 10000 }
                },
                required: ['voter', 'author', 'permlink', 'weight']
              }
            }
          }
        },
        responses: {
          200: { description: 'Vote submitted successfully' },
          400: { description: 'Invalid vote data' },
          500: { description: 'Failed to submit vote' },
        },
      },
    },
    '/api/v2/createpost': {
      post: {
        tags: ['V2 Utilities'],
        summary: 'Create a new post',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  author: { type: 'string' },
                  permlink: { type: 'string' },
                  title: { type: 'string' },
                  body: { type: 'string' },
                  json_metadata: { type: 'object' },
                  parent_permlink: { type: 'string' }
                },
                required: ['author', 'permlink', 'title', 'body']
              }
            }
          }
        },
        responses: {
          200: { description: 'Post created successfully' },
          400: { description: 'Invalid post data' },
          500: { description: 'Failed to create post' },
        },
      },
    },
    '/api/v2/skatespots': {
      get: {
        tags: ['V2 Utilities'],
        summary: 'Get skate spots data',
        parameters: [
          {
            in: 'query',
            name: 'location',
            required: false,
            schema: { type: 'string' },
            description: 'Filter by location'
          },
          {
            in: 'query',
            name: 'page',
            required: false,
            schema: { type: 'integer', minimum: 1, default: 1 }
          },
          {
            in: 'query',
            name: 'limit',
            required: false,
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 }
          }
        ],
        responses: {
          200: { description: 'Skate spots data with location info' },
          500: { description: 'Failed to fetch skate spots' },
        },
      },
    }
  },
};
