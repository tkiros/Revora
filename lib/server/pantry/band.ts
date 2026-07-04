import type { schema } from "../db";

type PantryBand = NonNullable<
  (typeof schema.pantryOrders.$inferSelect)["a1cBand"]
>;

/**
 * Buyers give a BAND at intake (no profile; locked decision 5), but
 * checkFood() takes a number. Each representative value lands squarely
 * inside its band's window in routeA1C, so the judge applies the band's own
 * conservative level — never a neighboring band's.
 */
const BAND_A1C: Record<PantryBand, number> = {
  prediabetes_57_59: 5.8,
  prediabetes_60_62: 6.1,
  prediabetes_63_64: 6.4
};

export function bandRepresentativeA1c(band: PantryBand): number {
  return BAND_A1C[band];
}
