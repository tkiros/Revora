/**
 * D5 photo-assist launch gate (plan §6.3.4 / launch audit BUG-10): the binding
 * pre-ship gates (100-meal dietitian-graded eval, counsel SaMD Q9, owner
 * green-light) are not yet evidenced, so production keeps the feature dormant
 * until the owner sets NEXT_PUBLIC_PHOTO_INPUT=1. Dev/preview/test stay on so
 * the feature remains exercisable end-to-end.
 *
 * Read by both the client button (build-time inlined) and the API route
 * (request-time) — one variable, two enforcement points.
 */
export function photoInputEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_PHOTO_INPUT === "1" ||
    process.env.NODE_ENV !== "production"
  );
}
