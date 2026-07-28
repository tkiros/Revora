// next/font/google is a build-time Next transform; in vitest its exports are
// not callable, so any component importing app/fonts.ts (the landing does, for
// the FINDING-030 className protection) would throw on render. Alias it to
// inert class handles — tests assert copy, not font wiring.
const stubFont = () => ({ className: "", variable: "", style: {} });

export const Plus_Jakarta_Sans = stubFont;
export const Source_Sans_3 = stubFont;
