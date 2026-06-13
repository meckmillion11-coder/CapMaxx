/**
 * Apply supabase/migrations/0004_intake_early_access.sql
 *
 * Requires SUPABASE_DB_URL in .env.local (Supabase → Project Settings → Database → URI)
 * Example: postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const envText = readFileSync(resolve(root, ".env.local"), "utf8");
const env = Object.fromEntries(
  envText
    .split("\n")
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const i = line.indexOf("=");
      return [line.slice(0, i).trim(), line.slice(i + 1).trim()];
    }),
);

const dbUrl = env.SUPABASE_DB_URL || env.DATABASE_URL || process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("\nMissing SUPABASE_DB_URL in .env.local");
  console.error("Get it from Supabase → Project Settings → Database → Connection string → URI");
  console.error("Then add: SUPABASE_DB_URL=postgresql://...\n");
  console.error("Or paste the SQL file into Supabase SQL Editor:");
  console.error("  supabase/migrations/0004_intake_early_access.sql\n");
  process.exit(1);
}

const sql = readFileSync(resolve(root, "supabase/migrations/0004_intake_early_access.sql"), "utf8");

const pg = await import("pg");
const client = new pg.default.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  await client.query(sql);
  console.log("✓ Intake migration applied successfully.");
} catch (err) {
  console.error("Migration failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
