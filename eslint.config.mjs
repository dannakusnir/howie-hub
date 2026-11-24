import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Portal data-access boundary: SQL (drizzle) lives only in lib/portal/data and lib/portal/db.
// Anything else that needs data calls the functions in lib/portal/data.
const PORTAL_DB_ALLOWED = [
  "lib/portal/data/**",
  "lib/portal/db/**",
  "lib/portal/auth.ts",
  "drizzle.config.ts",
  "scripts/**",
  "tests/**",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "drizzle-orm",
                "drizzle-orm/*",
                "@auth/drizzle-adapter",
                "@neondatabase/serverless",
                "**/portal/db",
                "**/portal/db/**",
                "**/db/client",
                "**/db/schema",
              ],
              message:
                "Database access is only allowed from lib/portal/data/**, lib/portal/db/**, lib/portal/auth.ts, drizzle.config.ts, scripts/** and tests/**. Call a function from lib/portal/data instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: PORTAL_DB_ALLOWED,
    rules: { "no-restricted-imports": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
