import { defineConfig } from "drizzle-kit";

import { resolveMigrationDatabaseUrl } from "./lib/server/db/config";

export default defineConfig({
  schema: "./lib/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: resolveMigrationDatabaseUrl(),
  }
});
