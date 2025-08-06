// Common schema definitions for reuse
export const commonSchemas = {
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          name: { type: 'string' },
          reputation: { type: 'number' },
          balance: { type: 'number' }
        }
      },
      Post: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          author: { type: 'string' },
          title: { type: 'string' },
          body: { type: 'string' },
          created: { type: 'string', format: 'date-time' }
        }
      },
      PaginationParams: {
        type: 'object',
        properties: {
          page: { type: 'integer', minimum: 1, default: 1 },
          limit: { type: 'integer', minimum: 1, maximum: 100, default: 25 }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    },
    parameters: {
      UsernameParam: {
        in: 'path',
        name: 'username',
        required: true,
        schema: { type: 'string' },
        description: 'Hive username'
      },
      PageParam: {
        in: 'query',
        name: 'page',
        required: false,
        schema: { type: 'integer', minimum: 1, default: 1 }
      },
      LimitParam: {
        in: 'query',
        name: 'limit',
        required: false,
        schema: { type: 'integer', minimum: 1, maximum: 100, default: 25 }
      }
    },
    responses: {
      Success: {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: { type: 'object' }
          }
        }
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      },
      ServerError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      }
    }
  }
};

// Helper function to create optimized endpoint documentation
export const createEndpoint = (config: {
  tags: string[];
  summary: string;
  description?: string;
  parameters?: any[];
  responses?: Record<string, any>;
}) => ({
  tags: config.tags,
  summary: config.summary,
  ...(config.description && { description: config.description }),
  ...(config.parameters && { parameters: config.parameters }),
  responses: config.responses || {
    200: { $ref: '#/components/responses/Success' },
    404: { $ref: '#/components/responses/NotFound' },
    500: { $ref: '#/components/responses/ServerError' }
  }
});
