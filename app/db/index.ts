import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/app/lib/env";
import * as schema from "@/app/db/schema";

/**
 * Shared database client.
 *
 * The underlying postgres connection is cached on `globalThis` so that Next.js
 * hot reloads in development do not open a new connection on every change.
 *
 * `prepare: false` and a small pool are required for serverless deployments
 * behind a transaction-mode pooler (e.g. Neon's pooled connection / PgBouncer),
 * which does not support prepared statements and recycles connections per
 * transaction. These settings are also harmless for a direct connection.
 */
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

const client =
  globalForDb.client ??
  postgres(env.DATABASE_URL, {
    prepare: false,
    max: 1,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
