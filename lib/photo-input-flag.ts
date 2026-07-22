/**
 * Counsel gate for photo assist — two boundaries, two env names (the
 * meal-memory twin pattern, lib/meal-memory-flag.ts):
 *
 *  - `photoInputEnabled()` — the CLIENT build flag (`NEXT_PUBLIC_PHOTO_INPUT`),
 *    fixed into a reviewed build at build time. Gates the photo button in the
 *    check form only.
 *
 *  - `photoInputServerEnabled(env)` — the SERVER flag (`PHOTO_INPUT_ENABLED`,
 *    NOT NEXT_PUBLIC). The photo-draft route 404s when this is off, so the
 *    endpoint can be killed by an env change + redeploy without a reviewed
 *    rebuild — the incident control the build-time flag could never be.
 *    `env` is injectable so tests can exercise it without mutating process.env.
 *
 * Both are fail-closed: only the exact value `1` enables anything.
 */

export function photoInputEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PHOTO_INPUT === "1";
}

export function photoInputServerEnabled(
  env: { PHOTO_INPUT_ENABLED?: string } = process.env as unknown as {
    PHOTO_INPUT_ENABLED?: string;
  }
): boolean {
  return env.PHOTO_INPUT_ENABLED === "1";
}
