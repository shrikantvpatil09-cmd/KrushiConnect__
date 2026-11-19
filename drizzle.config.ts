import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Load local settings when running Drizzle CLI; Render supplies DATABASE_URL
// through its environment settings.
config({ path: ".env.local" });
config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required. Set it in .env.local or the process environment.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
  strict: true,
  verbose: true,
});
