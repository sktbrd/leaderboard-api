export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Skatehive Leaderboard API',
    version: '1.0.0',
    description: 'API documentation for Skatehive Leaderboard',
  },
  paths: {
    '/api/skatehive': {
      get: {
        summary: 'Fetch leaderboard data from Supabase',
        responses: {
          200: { description: 'Leaderboard data' },
          500: { description: 'Failed to fetch data' },
        },
      },
    },
    '/api/ethHelpers': {
      get: {
        summary: 'Get Ethereum-related data',
        parameters: [
          {
            in: 'query',
            name: 'address',
            required: true,
            schema: { type: 'string' },
          },
          {
            in: 'query',
            name: 'method',
            required: true,
            schema: {
              type: 'string',
              enum: ['balance', 'votes', 'skatehiveNFTBalance'],
            },
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
        summary: 'Fetch and store leaderboard data',
        parameters: [
          {
            in: 'query',
            name: 'community',
            required: false,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Data fetched and stored successfully' },
          500: { description: 'Error in API route' },
        },
      },
      post: {
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
        summary: 'Execute cron job to update data',
        responses: {
          200: { description: 'Cron job executed successfully' },
          500: { description: 'Failed to execute cron job' },
        },
      },
    },
  },
};
