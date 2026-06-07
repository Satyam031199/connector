import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit configuration for migrations.
 *
 * drizzle-kit does not load .env automatically, so we load it here when present
 * (ignored if the file is missing, e.g. when env vars are already set in CI).
 */
try {
  process.loadEnvFile(".env");
} catch {
  // .env not present — assume DATABASE_URL is already in the environment.
}
export default defineConfig({
  dialect: "postgresql",
  schema: "./app/db/schema",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
