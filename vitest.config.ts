import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      // next-auth imports "next/server" bare; Node ESM resolution in vitest
      // needs the explicit .js form.
      "next/server": "next/server.js"
    }
  },
  test: {
    environment: "node",
    globals: true,
    server: {
      deps: {
        // Process next-auth through vite so the next/server alias above
        // applies (it is externalized by default and then fails Node ESM
        // resolution).
        inline: ["next-auth", "@auth/core", "@auth/drizzle-adapter"]
      }
    },
    include: ["tests/**/*.test.ts"],
    // Cold first-import of route modules can exceed the 5s default on a loaded
    // box (pre-existing flake in launch-controls.test.ts; the graded eval adds
    // import load). Sized for the slowest observed I/O-bound dev box — 20s
    // still failed DB-bound tests under full-suite load there (2026-07-06
    // launch audit BUG-11). Keeps bare `npm test` — the release gate —
    // reliably green without masking a genuinely hung test.
    testTimeout: 60_000,
    // PGlite boot in beforeAll can exceed the 10s default under full-suite
    // parallel load; a timed-out hook silently skips the whole file. 120s is
    // sized to the slowest observed I/O-bound dev box (45s still failed 6
    // files there — 2026-07-06 launch audit BUG-11); a genuine hang still trips it.
    hookTimeout: 120_000
  }
});
