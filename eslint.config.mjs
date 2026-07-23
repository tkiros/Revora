import coreWebVitals from "eslint-config-next/core-web-vitals";

/**
 * ESLint, bootstrapped 2026-07-11 (W-08).
 *
 * There was no ESLint config in this repo, and `eslint` was not even a
 * devDependency — despite `docs/qa/05-known-risks-and-blockers.md` marking QA-01
 * ("lint") as **Fixed**. Nothing was linting anything. The `npm run lint` script
 * this config backs is new; so is the CI step that runs it.
 *
 * `eslint-config-next` v16 ships a native flat config, so this pulls it in
 * directly — no @eslint/eslintrc FlatCompat shim (which chokes on it).
 *
 * ── Severity policy: errors gate, style advises ──────────────────────────────
 * Turning lint on for the first time against an existing codebase surfaces a
 * pile of pre-existing findings, and the tempting move — spend the session
 * reformatting a hundred files — buys nothing and makes every open branch
 * conflict. So the gate is set where it earns its keep:
 *
 *   ERROR (fails CI)  — real defects: hook-dependency bugs, misused Next
 *                       primitives, accessibility violations.
 *   WARN  (advisory)  — stylistic/idiom findings that cannot become a defect.
 *
 * The rule for changing this file: a rule may be downgraded to `warn` only if a
 * violation of it cannot produce a user-visible defect. If it can, fix the code.
 * Every downgrade below carries its reason. CI runs `--max-warnings=-1`, so
 * warnings are visible in the log and never silently block the build.
 */
const eslintConfig = [
  ...coreWebVitals,
  {
    ignores: [
      ".next/**",
      // Playwright uses isolated Next dist dirs (for example
      // `.next-e2e-trial`) so parallel projects cannot corrupt each other's
      // chunks. They are generated output just like `.next`, never source.
      ".next-*/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "artifacts/**",
      "drizzle/**", // generated migrations
      "video-engine/output/**", // generated render specs
      "next-env.d.ts", // generated
      // `.claude/worktrees/` holds a STALE FULL COPY of this repo, including its
      // built `.next/` output. Without this line eslint lints compiled webpack
      // chunks and reports ~700 "errors" in vendored bundles — which is exactly
      // the noise that makes a team turn lint off again. It is 0 real findings.
      ".claude/**"
    ]
  },
  {
    rules: {
      // ── Downgraded to warn: idiom, not correctness ──────────────────────────

      // `<img>` vs next/image. A real perf consideration, never a defect — and
      // some usages are deliberate (the PWA icon set; the Remotion frames under
      // video-engine/, which never run inside Next, where next/image is simply
      // the wrong tool).
      "@next/next/no-img-element": "warn",

      // Unescaped ' and " in JSX text. This codebase is mostly long-form health
      // copy and the rule fires on ordinary prose. React escapes the text
      // regardless, so it cannot produce a rendering bug. (The copy itself is
      // gated by the claims-boundary audit, which is the check that matters.)
      "react/no-unescaped-entities": "warn",

      // A synchronous state write during effect setup adds a cascading render
      // and can race StrictMode setup/cleanup. Client-only snapshots use
      // useSyncExternalStore; initial async loaders begin after effect commit.
      "react-hooks/set-state-in-effect": "error"
    }
  }
];

export default eslintConfig;
