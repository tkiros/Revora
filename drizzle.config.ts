import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Human action (§10): DATABASE_URL for dev/preview/prod Railway Postgres
    // instances (docs/adr/hosting-hybrid.md).
    url: process.env.DATABASE_URL ?? "postgres://localhost:5432/revora"
  }
});
