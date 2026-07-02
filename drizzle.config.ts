import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Human action (§10): DATABASE_URL for dev/preview/prod Neon branches.
    url: process.env.DATABASE_URL ?? "postgres://localhost:5432/revora"
  }
});
