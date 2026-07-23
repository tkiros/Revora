export function includesTrialWall(args: readonly string[]): boolean {
  const specFilters = args.filter(
    (arg) =>
      !arg.startsWith("-") &&
      (arg.endsWith(".ts") ||
        arg.includes(".spec") ||
        arg.includes("tests/"))
  );
  const concreteSpecFilters = specFilters.filter((arg) =>
    arg.endsWith(".spec.ts")
  );

  return (
    specFilters.length === 0 ||
    concreteSpecFilters.length !== specFilters.length ||
    concreteSpecFilters.some((arg) => arg.includes("trial-wall"))
  );
}
