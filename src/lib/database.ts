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

export class HAFSQL_Database {
  private pool: Pool;
  private tablesList: string[] = [];
  private viewsList: string[] = [];
  private databaseList: string = '';
  private databaseSchema: DatabaseSchema = {};

  constructor() {    
    const poolConfig: PoolConfig = {
      host: process.env.HAFSQL_SERVER || '',
      user: process.env.HAFSQL_USER || '',
      password: process.env.HAFSQL_PWD || '',
      database: process.env.HAFSQL_DATABASE || ''
    };

    this.pool = new Pool(poolConfig);
    this.initializeTables();
  }

  private async initializeTables(): Promise<void> {
    try {
      const client = await this.pool.connect();

      try {
        // // Get table names
        // const tableResult = await client.query(SQL_QUERIES.select_tables);
        // this.tablesList = tableResult.rows
        //   .filter(row => this.isTableAvailable(row[0]))
        //   .map(row => row[0]);

        // // Get views names
        // const viewResult = await client.query(SQL_QUERIES.select_views);
        // this.viewsList = viewResult.rows
        //   .filter(row => this.isTableAvailable(row[0]))
        //   .map(row => row[0]);

        // // Get table schemas
        // const tableSchemaResult = await client.query(SQL_QUERIES.create_tables_schema);
        // for (const row of tableSchemaResult.rows) {
        //   const createStatement = row[0];
        //   const match = createStatement.match(/CREATE TABLE (\w+)/);
        //   if (match) {
        //     const tableName = match[1];
        //     if (this.isTableAvailable(tableName)) {
        //       this.databaseSchema[tableName] = createStatement;
        //     }
        //   }
        // }

        // // Get view schemas
        // const viewSchemaResult = await client.query(SQL_QUERIES.create_views_schema);
        // for (const row of viewSchemaResult.rows) {
        //   const createStatement = row[0];
        //   const match = createStatement.match(/CREATE VIEW (\w+)/);
        //   if (match) {
        //     const tableName = match[1];
        //     if (this.isTableAvailable(tableName)) {
        //       this.databaseSchema[tableName] = createStatement;
        //     }
        //   }
        // }

        // // Create formatted database list
        // this.databaseList = `TABLES:\n\`\`\`sql\n${this.tablesList.join('\n')}\n\`\`\`\nVIEWS:\n\`\`\`sql\n${this.viewsList.join('\n')}\n\`\`\``;

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
      const result = await client.query({
        text: query,
      });

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

// You'll need to define these constants
//   select_tables: 'your_tables_query_here',
//   select_views: 'your_views_query_here',
//   create_tables_schema: 'your_tables_schema_query_here',
//   create_views_schema: 'your_views_schema_query_here'
// };


const SKIP_TABLES: string[] = []; // Add tables to skip here