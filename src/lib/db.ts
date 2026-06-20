import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@/models/schema';

const DATABASE_URL = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/p1vsp2';

if (!DATABASE_URL) {
  throw new Error('Please define the DATABASE_URL environment variable inside .env.local');
}

/**
 * Cache the database connection in development to prevent connection leaks
 */
let cached = (global as any).drizzle;

if (!cached) {
  cached = (global as any).drizzle = { conn: null, pool: null };
}

export function getDb() {
  if (cached.conn) {
    return cached.conn;
  }

  console.log('📡 Connecting to PostgreSQL database...');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  cached.pool = pool;
  cached.conn = drizzle(pool, { schema });
  return cached.conn;
}

export const db = getDb();
export default getDb;

// Export an async dbConnect helper for compatibility with database connection references
export async function dbConnect() {
  return db;
}

export { schema };
