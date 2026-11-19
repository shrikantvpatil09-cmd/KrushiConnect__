import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Configure it in the Render environment settings.");
}

type DbGlobal = typeof globalThis & { __krushiConnectPool?: Pool };
const globalForDb = globalThis as DbGlobal;

const pool = globalForDb.__krushiConnectPool ?? new Pool({
  connectionString: databaseUrl,
  max: Number(process.env.PG_POOL_MAX || 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
  keepAlive: true,
  application_name: "krishiconnect",
});

if (process.env.NODE_ENV !== "production") {
  globalForDb.__krushiConnectPool = pool;
}

export { pool };
export const db = drizzle(pool);
