import sql, { ConnectionPool, config as SqlConfig } from 'mssql';

interface HiveSQLConfig extends SqlConfig {
  user: string;
  password: string;
  server: string;
  database: string;
  options?: {
    encrypt?: boolean;                // depending on your server config
    trustServerCertificate?: boolean; // for self-signed certs
    requestTimeout?: number           // ⏱️ Increase to 2 minutes
  };
  pool?: {
    max?: number;
    min?: number;
    idleTimeoutMillis?: number;
  };
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
        trustServerCertificate: true, // change as needed
        requestTimeout: 120000 // ⏱️ Increase to 2 minutes
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
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
      await this.pool.connect();
    }
  }

  async executeQuery(query: string): Promise<{ recordset: any[] }> {
    if (!this.pool) {
      throw new Error('Connection pool not initialized');
    }
    try {
      await this.connect();
      const result = await this.pool.request().query(query);
      return result;
    } catch (error) {
      console.error('SQL Server query error:', error);
      throw error;
    }
  }

  async close() {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
    }
  }
}
