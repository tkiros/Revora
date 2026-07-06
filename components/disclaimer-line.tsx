import Link from "next/link";

// Verbatim `result-footer` ledger row (docs/safety/copy-ledger.md) — the one
// stable disclaimer across active result surfaces (claims-boundary.md §"one
// result-footer disclaimer"). Server responses carry their own copy of this
// string; static pages import the constant.
export const RESULT_FOOTER_DISCLAIMER =
  "Revora is informational only and is not medical advice. Talk with a doctor or registered dietitian for guidance that is specific to you.";

export function DisclaimerLine({
  disclaimer = RESULT_FOOTER_DISCLAIMER
}: {
  disclaimer?: string;
}) {
  return (
    <p className="result-disclaimer">
      {disclaimer}{" "}
      <Link className="result-disclaimer-link" href="/privacy">
        Privacy
      </Link>
    </p>
  );
}
