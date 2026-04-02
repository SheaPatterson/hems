import sql from 'mssql';

/**
 * Azure SQL connection pool helper.
 *
 * Uses a singleton pool so all functions in the same host instance
 * share one connection pool, avoiding per-request connection overhead.
 */

let pool: sql.ConnectionPool | null = null;

const sqlConfig = {
  server: process.env.AZURE_SQL_SERVER || 'localhost',
  database: process.env.AZURE_SQL_DATABASE || 'hemsopsdb',
  user: process.env.AZURE_SQL_USER || '',
  password: process.env.AZURE_SQL_PASSWORD || '',
  options: {
    encrypt: true,
    trustServerCertificate: process.env.NODE_ENV !== 'production',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
} as sql.config;

/**
 * Get or create the shared Azure SQL connection pool.
 */
export async function getPool(): Promise<sql.ConnectionPool> {
  if (pool && pool.connected) {
    return pool;
  }

  pool = await new sql.ConnectionPool(sqlConfig).connect();
  return pool;
}

/**
 * Execute a parameterized query against Azure SQL.
 *
 * Example:
 *   const result = await query('SELECT * FROM hospitals WHERE id = @id', { id: someId });
 */
export async function query<T = any>(
  text: string,
  params?: Record<string, unknown>
): Promise<sql.IResult<T>> {
  const db = await getPool();
  const request = db.request();

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      request.input(key, value);
    }
  }

  return request.query<T>(text);
}

/**
 * Close the connection pool (for graceful shutdown).
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.close();
    pool = null;
  }
}
