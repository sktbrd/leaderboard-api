import { commonSchemas, createEndpoint } from './swagger-schemas';

// Optimized swagger document with reusable components
export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Skatehive Leaderboard API',
    version: '2.0.0',
    description: 'Complete API documentation for Skatehive Leaderboard with V1 and V2 endpoints',
  },
  tags: [
    { name: 'V1 Legacy', description: 'Legacy V1 API endpoints' },
    { name: 'V2 Core', description: 'V2 Core API endpoints - main functionality' },
    { name: 'V2 Feed', description: 'V2 Feed endpoints - content feeds and posts' },
    { name: 'V2 Social', description: 'V2 Social endpoints - followers, following, profiles' },
    { name: 'V2 Wallet', description: 'V2 Wallet endpoints - balances and financial data' },
    { name: 'V2 SkateSnaps', description: 'V2 SkateSnaps endpoints - short-form content' },
    { name: 'V2 Utilities', description: 'V2 Utility endpoints - voting, comments, spots' }
  ],
  ...commonSchemas,
  paths: {
    // V1 Legacy Endpoints
    '/api/skatehive': {
      get: createEndpoint({
        tags: ['V1 Legacy'],
        summary: 'Fetch leaderboard data from Supabase'
      })
    },
    '/api/ethHelpers': {
      get: createEndpoint({
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
              enum: ['balance', 'votes', 'skatehiveNFTBalance']
            },
            description: 'Method to call'
          }
        ]
      })
    },
    '/api/leaderboard': {
      get: createEndpoint({
        tags: ['V1 Legacy'],
        summary: 'Fetch and store leaderboard data',
        parameters: [{
          in: 'query',
          name: 'community',
          required: false,
          schema: { type: 'string' },
          description: 'Community name to filter by'
        }]
      }),
      post: createEndpoint({
        tags: ['V1 Legacy'],
        summary: 'Fetch and store leaderboard data for a community'
      })
    },

    // V2 Core Endpoints
    '/api/v2': {
      get: createEndpoint({
        tags: ['V2 Core'],
        summary: 'V2 API overview and available endpoints'
      })
    },
    '/api/v2/leaderboard': {
      get: createEndpoint({
        tags: ['V2 Core'],
        summary: 'Get V2 leaderboard data'
      })
    },

    // V2 Profile Endpoints
    '/api/v2/profile': {
      get: createEndpoint({
        tags: ['V2 Social'],
        summary: 'Get all profiles'
      })
    },
    '/api/v2/profile/{username}': {
      get: createEndpoint({
        tags: ['V2 Social'],
        summary: 'Get specific user profile by username path',
        parameters: [{ $ref: '#/components/parameters/UsernameParam' }]
      })
    },

    // V2 Feed Endpoints
    '/api/v2/feed': {
      get: createEndpoint({
        tags: ['V2 Feed'],
        summary: 'Get general feed',
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' }
        ]
      })
    },
    '/api/v2/feed/{username}': {
      get: createEndpoint({
        tags: ['V2 Feed'],
        summary: 'Get user-specific feed',
        parameters: [
          { $ref: '#/components/parameters/UsernameParam' },
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' }
        ]
      })
    },
    '/api/v2/feed/trending': {
      get: createEndpoint({
        tags: ['V2 Feed'],
        summary: 'Get trending posts feed',
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' }
        ]
      })
    },

    // V2 Social Endpoints
    '/api/v2/followers/{username}': {
      get: createEndpoint({
        tags: ['V2 Social'],
        summary: 'Get user followers',
        parameters: [{ $ref: '#/components/parameters/UsernameParam' }]
      })
    },
    '/api/v2/following/{username}': {
      get: createEndpoint({
        tags: ['V2 Social'],
        summary: 'Get users that a user is following',
        parameters: [{ $ref: '#/components/parameters/UsernameParam' }]
      })
    },

    // V2 Wallet Endpoints
    '/api/v2/balance/{username}': {
      get: createEndpoint({
        tags: ['V2 Wallet'],
        summary: 'Get user balance information',
        parameters: [{ $ref: '#/components/parameters/UsernameParam' }]
      })
    },

    // V2 SkateSnaps Endpoints
    '/api/v2/skatesnaps': {
      get: createEndpoint({
        tags: ['V2 SkateSnaps'],
        summary: 'Get all skate snaps',
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' }
        ]
      })
    },
    '/api/v2/skatesnaps/{username}': {
      get: createEndpoint({
        tags: ['V2 SkateSnaps'],
        summary: 'Get user-specific skate snaps',
        parameters: [
          { $ref: '#/components/parameters/UsernameParam' },
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' }
        ]
      })
    },
    '/api/v2/skatesnaps/trending': {
      get: createEndpoint({
        tags: ['V2 SkateSnaps'],
        summary: 'Get trending skate snaps',
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' }
        ]
      })
    },

    // V2 Utility Endpoints
    '/api/v2/vote': {
      post: createEndpoint({
        tags: ['V2 Utilities'],
        summary: 'Cast a vote on content'
      })
    },
    '/api/v2/comments': {
      get: createEndpoint({
        tags: ['V2 Utilities'],
        summary: 'Get comments',
        parameters: [
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' }
        ]
      }),
      post: createEndpoint({
        tags: ['V2 Utilities'],
        summary: 'Create a new comment'
      })
    },
    '/api/v2/createpost': {
      post: createEndpoint({
        tags: ['V2 Utilities'],
        summary: 'Create a new post'
      })
    },
    '/api/v2/market': {
      get: createEndpoint({
        tags: ['V2 Utilities'],
        summary: 'Get market data'
      })
    },
    '/api/v2/skatespots': {
      get: createEndpoint({
        tags: ['V2 Utilities'],
        summary: 'Get skate spots information',
        parameters: [
          {
            in: 'query',
            name: 'location',
            required: false,
            schema: { type: 'string' },
            description: 'Filter by location'
          },
          { $ref: '#/components/parameters/PageParam' },
          { $ref: '#/components/parameters/LimitParam' }
        ]
      })
    }
  }
};
