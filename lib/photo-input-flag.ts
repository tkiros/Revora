/**
 * Counsel gate for photo assist. The feature is fail-closed: only the exact
 * value `1` enables the client control and the server route. Because this is a
 * NEXT_PUBLIC build-time value, changing it requires a new reviewed build.
 */
export function photoInputEnabled(): boolean {
  return process.env.NEXT_PUBLIC_PHOTO_INPUT === "1";
}
