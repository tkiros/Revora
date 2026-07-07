/**
 * D5 photo-assist launch flag. Owner green-light given 2026-07-07 (photo is
 * one of the three first-class input methods: text, voice, camera), so the
 * feature is ON by default everywhere. NEXT_PUBLIC_PHOTO_INPUT=0 is the
 * kill-switch if the eval/counsel gates (launch audit BUG-10) surface a
 * problem post-launch.
 *
 * Read by both the client button (build-time inlined) and the API route
 * (request-time) — one variable, two enforcement points.
 */
export function photoInputEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PHOTO_INPUT !== "0";
}
