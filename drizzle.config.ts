import { defineConfig } from "drizzle-kit";

// `drizzle-kit generate` needs no database. `migrate` / `push` read the UNPOOLED url.
export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/portal/db/schema.ts",
  out: "./drizzle",
  ...(process.env.DATABASE_URL_UNPOOLED
    ? { dbCredentials: { url: process.env.DATABASE_URL_UNPOOLED } }
    : {}),
});
