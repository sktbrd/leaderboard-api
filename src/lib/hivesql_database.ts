import sql, { ConnectionPool, config as SqlConfig, IProcedureResult } from 'mssql';

interface HiveSQLConfig extends SqlConfig {
  user: string;
  password: string;
  server: string;
  database: string;
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
    requestTimeout?: number; // Timeout for queries
    connectTimeout?: number; // Timeout for connections
  };
  pool?: {
    max?: number;
    min?: number;
    idleTimeoutMillis?: number;
  };
}

interface QueryInput {
  name: string;
  type: any; // sql.Int, sql.NVarChar, etc.
  value: any; // number, string, etc.
}

export class HiveSQL_Database {
  private pool: ConnectionPool | null = null;

  constructor() {
    const config: HiveSQLConfig = {
      user: process.env.HIVESQL_USER || '',
      password: process.env.HIVESQL_PWD || '',
      server: process.env.HIVESQL_SERVER || '',
      database: process.env.HIVESQL_DATABASE || '',
      options: {
        encrypt: true, // Set to false if not using encrypted connection
        trustServerCertificate: true, // For self-signed certs
        requestTimeout: 180000, // 3 minutes to handle slow queries
        connectTimeout: 30000, // 30 seconds for connection
      },
      pool: {
        max: 20, // Increased for concurrent queries
        min: 0,
        idleTimeoutMillis: 60000, // 60 seconds for idle connections
      },
    };

    if (!config.user || !config.password || !config.server || !config.database) {
      throw new Error('Missing SQL Server environment variables');
    }

    this.pool = new sql.ConnectionPool(config);
  }

  async connect() {
    if (!this.pool) {
      throw new Error('Connection pool not initialized');
    }
    if (!this.pool.connected) {
      console.log('Connecting to HiveSQL database...');
      await this.pool.connect();
      console.log('HiveSQL database connected');
    }
  }

  async executeQuery(query: string, inputs: QueryInput[] = []): Promise<{ recordset: any[] }> {
    if (!this.pool) {
      throw new Error('Connection pool not initialized');
    }
    try {
      await this.connect();
      const request = this.pool.request();
      inputs.forEach(({ name, type, value }) => request.input(name, type, value));

      console.time(`HiveSQL Query: ${query.substring(0, 50)}...`);
      const result = await request.query(query);
      console.timeEnd(`HiveSQL Query: ${query.substring(0, 50)}...`);

      return { recordset: result.recordset };
    } catch (error) {
      console.error('SQL Server query error:', {
        query: query.substring(0, 100) + '...',
        inputs: inputs.map(i => ({ name: i.name, value: i.value })),
        error,
      });
      throw error;
    }
  }

  async close() {
    if (this.pool && this.pool.connected) {
      console.log('Closing HiveSQL database connection...');
      await this.pool.close();
      this.pool = null;
      console.log('HiveSQL database connection closed');
    }
  }
}