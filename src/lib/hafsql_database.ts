import { Pool, PoolConfig } from 'pg';

// interface DBConfig {
//   user: string;
//   password: string;
//   server: string;
//   database: string;
// }

interface DatabaseSchema {
  [key: string]: string;
}

// If needed, define these constants
const SQL_QUERIES = {
  select_tables: 'your_tables_query_here',
  select_views: 'your_views_query_here',
  create_tables_schema: 'your_tables_schema_query_here',
  create_views_schema: 'your_views_schema_query_here'
}

const SKIP_TABLES: string[] = []; // Add tables to skip here

export class HAFSQL_Database {
  private pool: Pool;
  private tablesList: string[] = [];
  private viewsList: string[] = [];
  private databaseList: string = '';
  private databaseSchema: DatabaseSchema = {};

  constructor() {
    const requiredEnv = ['HAFSQL_SERVER', 'HAFSQL_USER', 'HAFSQL_PWD', 'HAFSQL_DATABASE'];

    for (const key of requiredEnv) {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    }

    const poolConfig: PoolConfig = {
      host: process.env.HAFSQL_SERVER!,
      user: process.env.HAFSQL_USER!,
      password: process.env.HAFSQL_PWD!,
      database: process.env.HAFSQL_DATABASE!,
      connectionTimeoutMillis: 5000, // 5 seconds to get a connection
      idleTimeoutMillis: 10000,      // 10 seconds idle before closing
      max: 10                        // optional: ma || ''x number of clients in pool
    };

    this.pool = new Pool(poolConfig);
    // do not need
    // this.initializeTables();
  }

  async testConnection(timeout = 5000): Promise<void> {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('DB connection timed out')), timeout)
    );

    const connectPromise = (async () => {
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1');
      } finally {
        client.release();
      }
    })();

    try {
      await Promise.race([timeoutPromise, connectPromise]);
    } catch (err: any) {
      console.error('DB connection failed:', {
        name: err?.name,
        message: err?.message,
        code: err?.code,
        severity: err?.severity,
      });
      throw err;
    }
  }

  private async initializeTables(): Promise<void> {
    try {
      const client = await this.pool.connect();

      try {
        // Get table names
        const tableResult = await client.query(SQL_QUERIES.select_tables);
        this.tablesList = tableResult.rows
          .filter(row => this.isTableAvailable(row[0]))
          .map(row => row[0]);

        // Get views names
        const viewResult = await client.query(SQL_QUERIES.select_views);
        this.viewsList = viewResult.rows
          .filter(row => this.isTableAvailable(row[0]))
          .map(row => row[0]);

        // Get table schemas
        const tableSchemaResult = await client.query(SQL_QUERIES.create_tables_schema);
        for (const row of tableSchemaResult.rows) {
          const createStatement = row[0];
          const match = createStatement.match(/CREATE TABLE (\w+)/);
          if (match) {
            const tableName = match[1];
            if (this.isTableAvailable(tableName)) {
              this.databaseSchema[tableName] = createStatement;
            }
          }
        }

        // Get view schemas
        const viewSchemaResult = await client.query(SQL_QUERIES.create_views_schema);
        for (const row of viewSchemaResult.rows) {
          const createStatement = row[0];
          const match = createStatement.match(/CREATE VIEW (\w+)/);
          if (match) {
            const tableName = match[1];
            if (this.isTableAvailable(tableName)) {
              this.databaseSchema[tableName] = createStatement;
            }
          }
        }

        // Create formatted database list
        this.databaseList = `TABLES:\n\`\`\`sql\n${this.tablesList.join('\n')}\n\`\`\`\nVIEWS:\n\`\`\`sql\n${this.viewsList.join('\n')}\n\`\`\``;

      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Database initialization error:', error);
      throw error;
    }
  }

  private isTableAvailable(tableName: string): boolean {
    return !SKIP_TABLES.includes(tableName);
  }


  async executeQuery(query: string, // fetchSize: number = 100
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<[any[], string[]]> {
    const client = await this.pool.connect();
    try {

      console.time(`HafSQL Query: ${query.substring(0, 50)}...`);
      const result = await client.query({
        text: query,
      });
      console.timeEnd(`HafSQL Query: ${query.substring(0, 50)}...`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const header = result.fields.map((field: { name: any; }) => field.name);
      return [result.rows, header];
    } catch (error) {
      console.error('Query execution error:', (error as Error).message);
      return [[], []];
    } finally {
      client.release();
    }
  }

  getTablesList(): string[] {
    return this.tablesList;
  }

  getViewsList(): string[] {
    return this.viewsList;
  }

  getDatabaseList(): string {
    return this.databaseList;
  }

  getDatabaseSchema(): DatabaseSchema {
    return this.databaseSchema;
  }
}
