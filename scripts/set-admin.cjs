const { config } = require("dotenv");
const { Pool } = require("pg");
const { randomBytes, scryptSync } = require("crypto");

config({ path: ".env.local" });
config();

const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Check your root .env.local file.");
}
if (!email || !password) {
  throw new Error("ADMIN_EMAIL or ADMIN_PASSWORD is missing.");
}
if (password.length < 6) {
  throw new Error("Password must be at least 6 characters.");
}

const salt = randomBytes(16).toString("hex");
const hash = scryptSync(password, salt, 64).toString("hex");
const passwordHash = `${salt}:${hash}`;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("sslmode=")
    ? undefined
    : { rejectUnauthorized: false },
});

(async () => {
  try {
    const result = await pool.query(
      `INSERT INTO users
        (name, email, password_hash, is_admin, is_suspended, is_verified)
       VALUES ($1, $2, $3, TRUE, FALSE, TRUE)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         is_admin = TRUE,
         is_suspended = FALSE,
         is_verified = TRUE,
         updated_at = NOW()
       RETURNING id, name, email, is_admin`,
      ["Shrikant Patil", email, passwordHash]
    );

    console.log("Admin account successfully configured:", result.rows[0].email);
    console.log("Admin access enabled. Sign out and sign in again.");
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error("Admin setup failed:", error.message);
  process.exitCode = 1;
});
