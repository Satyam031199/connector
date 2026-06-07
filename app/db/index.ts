import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "@/app/lib/env";
import * as schema from "@/app/db/schema";

/**
 * Shared database client.
 *
 * The underlying postgres connection is cached on `globalThis` so that Next.js
 * hot reloads in development do not open a new connection on every change.
 */
const globalForDb = globalThis as unknown as {
  client: ReturnType<typeof postgres> | undefined;
};

const client = globalForDb.client ?? postgres(env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") {
  globalForDb.client = client;
}

export const db = drizzle(client, { schema });
