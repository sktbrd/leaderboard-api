import { Pool, PoolConfig, QueryResult } from 'pg';

interface HAFSQLConfig extends PoolConfig {
  user: string;
  password: string;
  host: string;
  database: string;
  port?: number;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

interface QueryInput {
  name: string;
  value: any;
}

export class HAFSQL_Database {
  private pool: Pool | null = null;
  private readonly maxRetries: number = 3;
  private readonly retryDelay: number = 1000; // 1 second
  private activeConnections: number = 0;

  constructor() {
    const config: HAFSQLConfig = {
      user: process.env.HAFSQL_USER || '',
      password: process.env.HAFSQL_PWD || '',
      host: process.env.HAFSQL_SERVER || '',
      database: process.env.HAFSQL_DATABASE || '',
      // port: parseInt(process.env.HAFSQL_PORT || '5432', 10),
      max: 2, // Per admin's recommendation
      idleTimeoutMillis: 60000, // 60 seconds
      connectionTimeoutMillis: 30000, // 30 seconds
    };

    if (!config.user || !config.password || !config.host || !config.database) {
      throw new Error('Missing HafSQL environment variables');
    }

    this.pool = new Pool(config);

    this.pool.on('error', (err) => {
      console.error('PostgreSQL pool error:', err);
    });

    this.pool.on('connect', () => {
      this.activeConnections++;
      console.debug(`Connection acquired. Active connections: ${this.activeConnections}`);
    });

    this.pool.on('remove', () => {
      this.activeConnections--;
      console.debug(`Connection released. Active connections: ${this.activeConnections}`);
    });
  }

  async executeQuery(query: string, inputs: QueryInput[] = []): Promise<QueryResult> {
    if (!this.pool) {
      throw new Error('Connection pool not initialized');
    }
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const values = inputs.map(i => i.value);
        const text = inputs.length
          ? query.replace(/@(\w+)/g, (_, name) => `$${inputs.findIndex(i => i.name === name) + 1}`)
          : query;

        console.time(`⏱️ HAFSQL Query: ${query.substring(0, 20)}...`);
        const result = await this.pool.query(text, values);
        console.timeEnd(`⏱️ HAFSQL Query: ${query.substring(0, 20)}...`);

        // if (result.rows.length > 0) {
        //   console.debug('Sample recordset:', JSON.stringify(result.rows[0], null, 2));
        // }

        return result;
      } catch (error: any) {
        console.error(`Query attempt ${attempt} failed:`, {
          query: query.substring(0, 100) + '...',
          inputs: inputs.map(i => ({ name: i.name, value: i.value })),
          activeConnections: this.activeConnections,
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
    if (this.pool) {
      console.log('Closing HAFSQL database connection...');
      try {
        await this.pool.end();
        console.log('HAFSQL database connection closed');
      } catch (error: any) {
        console.error('Error closing HAFSQL connection:', error.message);
      }
      this.pool = null;
      this.activeConnections = 0;
    }
  }

  getActiveConnections(): number {
    return this.activeConnections;
  }
}