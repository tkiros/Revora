/**
 * Counsel gate for longitudinal insights. Only the exact value `1` enables
 * derived pattern output. This NEXT_PUBLIC value is shared by server and
 * client boundaries and is fixed into a reviewed build at build time.
 */
export function longitudinalInsightsEnabled(): boolean {
  return process.env.NEXT_PUBLIC_LONGITUDINAL_INSIGHTS === "1";
}
