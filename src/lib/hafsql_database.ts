import { Pool, PoolConfig, QueryResult } from 'pg';

interface HAFSQLConfig extends PoolConfig {
  user: string;
  password: string;
  host: string;
  database: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

interface QueryInput {
  name: string;
  value: any;
}

let pool: Pool | null = null;
let activeConnections: number = 0;

function initializePool(): Pool {
  if (!pool) {
    const config: HAFSQLConfig = {
      user: process.env.HAFSQL_USER || '',
      password: process.env.HAFSQL_PWD || '',
      host: process.env.HAFSQL_SERVER || '',
      database: process.env.HAFSQL_DATABASE || '',
      max: 5, // Per admin's recommendation
      idleTimeoutMillis: 300000, // 5 minutes
      connectionTimeoutMillis: 30000, // 30 seconds
    };

    if (!config.user || !config.password || !config.host || !config.database) {
      throw new Error('Missing HafSQL environment variables');
    }

    pool = new Pool(config);

    pool.on('error', (err) => {
      // console.error('PostgreSQL pool error:', err);
    });

    pool.on('connect', () => {
      activeConnections++;
      // console.debug(`Connection acquired. Active connections: ${activeConnections}`);
    });

    pool.on('remove', () => {
      activeConnections--;
      // console.debug(`Connection released. Active connections: ${activeConnections}`);
    });
  }
  return pool;
}

export class HAFSQL_Database {
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000; // 1 second

  constructor() {
    initializePool();
  }

async executeQuery(query: string, inputs: QueryInput[] = []): Promise<{ rows: any[]; headers: string[] }> {
    if (!pool) {
      throw new Error('Connection pool not initialized');
    }
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const values = inputs.map(i => i.value);
        const text = inputs.length
          ? query.replace(/@(\w+)/g, (_, name) => `$${inputs.findIndex(i => i.name === name) + 1}`)
          : query;

        // console.time(`⏱️ HAFSQL Query: ${query.substring(0, 20)}...`);
        const result = await pool.query(text, values);
        // console.timeEnd(`⏱️ HAFSQL Query: ${query.substring(0, 20)}...`);

        return {
          rows: result.rows,
          headers: result.fields.map(f => f.name),
        };

      } catch (error: any) {
        console.error(`Query attempt ${attempt} failed:`, {
          query: query.substring(0, 100) + '...',
          inputs: inputs.map(i => ({ name: i.name, value: i.value })),
          activeConnections,
          error: error.message,
        });
        if (attempt < this.maxRetries && this.isTransientError(error)) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          continue;
        }
        throw error;
      }
    }
    throw new Error('Query execution failed after retries');
  }

  private isTransientError(error: any): boolean {
    return (
      error.code === 'ECONNREFUSED' ||
      error.code === 'ETIMEDOUT' ||
      error.message.includes('server closed the connection unexpectedly') ||
      error.message.includes('terminating connection due to administrator command')
    );
  }

  async close() {
    // Pool persists until Vercel instance terminates
  }

  getActiveConnections(): number {
    return activeConnections;
  }
}