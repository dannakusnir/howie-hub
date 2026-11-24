import "server-only";
import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool } from "@neondatabase/serverless";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { databaseUrl } from "../env";
import * as schema from "./schema";

/** Any Drizzle Postgres database (Neon in production, PGlite in tests) or a transaction of one. */
export type PortalDb = PgDatabase<PgQueryResultHKT, typeof schema>;

let cached: PortalDb | null = null;

/** Lazily created from DATABASE_URL on first use (never at import or build time). */
export function getDb(): PortalDb {
  if (cached === null) {
    const pool = new Pool({ connectionString: databaseUrl() });
    cached = drizzle(pool, { schema }) as unknown as PortalDb;
  }
  return cached;
}

/** Test seam: inject a database instance (PGlite), or pass null to reset. */
export function setDbForTests(db: PortalDb | null): void {
  cached = db;
}
