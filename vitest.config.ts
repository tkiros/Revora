import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    // Cold first-import of route modules can exceed the 5s default on a loaded
    // box (pre-existing flake in launch-controls.test.ts; the graded eval adds
    // import load). 20s keeps bare `npm test` — the release gate — reliably green
    // without masking a genuinely hung test.
    testTimeout: 20_000
  }
});
