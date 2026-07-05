/**
 * The betrayal-aha demo (handoff §7): the product in action, as static
 * fixture markup using the REAL result-card classes — always pixel-true,
 * crawlable, and claims-audited via the copy ledger. No live check runs here.
 */
export function DemoCheckCard() {
  return (
    <section className="surface-card" aria-label="Example check" data-testid="demo-check-card">
      <p className="status-eyebrow">A real example</p>
      <p className="page-copy">
        You type: <strong>oatmeal</strong>
      </p>
      <div className="result-card" data-risk="MODERATE">
        <p className="result-eyebrow">Revora answers</p>
        <h2 className="page-title">Be careful</h2>
        <p className="page-copy">
          Oatmeal on its own is a carb-heavy start, so it can have a higher
          blood-sugar impact than its healthy reputation suggests.
        </p>
        <div className="result-list">
          <p className="page-copy">
            <strong>Adjustment:</strong> If practical, add protein — Greek
            yogurt, nuts, or eggs on the side — to make it easier to handle.
          </p>
          <p className="page-copy">
            <strong>Swap:</strong> Steel-cut oats hold up steadier than
            instant packets.
          </p>
        </div>
        <p className="result-disclaimer">
          Revora is informational only and is not medical advice. Talk with a
          doctor or registered dietitian for guidance that is specific to you.
        </p>
      </div>
    </section>
  );
}
