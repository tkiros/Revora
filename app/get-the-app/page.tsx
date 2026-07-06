export const metadata = { title: "Get Revora on your phone — Revora" };

export default function GetTheAppPage() {
  const waitlistUrl = process.env.NEXT_PUBLIC_WAITLIST_URL;
  return (
    <main className="page-shell">
      <div className="page-frame">
        <section className="surface-card hero-card">
          <p className="hero-eyebrow">On your phone</p>
          <h1 className="page-title">Revora already works on your phone</h1>
          <p className="page-copy">
            The web app installs to your home screen and works like an app —
            no store, no download, same checks.
          </p>
          <h2 className="section-title">Android (Chrome)</h2>
          <p className="page-copy">
            Open Revora in Chrome, tap the menu (⋮), then &quot;Add to Home
            screen&quot;, then Add.
          </p>
          <h2 className="section-title">iPhone (Safari)</h2>
          <p className="page-copy">
            Open Revora in Safari, tap Share, then &quot;Add to Home
            Screen&quot;, then Add.
          </p>
          {waitlistUrl ? (
            <>
              <h2 className="section-title">Prefer the store version?</h2>
              <p className="page-copy">
                Leave your email and we&apos;ll tell you when the Play Store or
                App Store version ships. Nothing else, ever.
              </p>
              <a className="primary-button link-button" href={waitlistUrl}>
                Tell me when it ships
              </a>
            </>
          ) : null}
        </section>
      </div>
    </main>
  );
}
