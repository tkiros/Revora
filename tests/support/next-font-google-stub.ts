// next/font/google is a build-time Next transform; in vitest its exports are
// not callable, so any component importing app/fonts.ts (the landing does, for
// the FINDING-030 className protection) would throw on render. Alias it to
// stand-ins with DISTINGUISHABLE class markers — an empty-string stub would let
// "font class deleted" render identically to "font class applied", masking the
// exact wiring these classes exist to guarantee. landing-wiring-pins.test.ts
// asserts the markers land on <body> and the landing root.
const font = (marker: string) => () => ({
  className: `__stub_${marker}`,
  variable: `__stub_${marker}_var`,
  style: {}
});

export const Plus_Jakarta_Sans = font("plus_jakarta_sans");
export const Source_Sans_3 = font("source_sans_3");
