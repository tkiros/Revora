import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";

import { AttributionCapture } from "../components/attribution-capture";
import { SwRegister } from "../components/sw-register";

import "./globals.css";

// Umami analytics (plan P7; docs/adr/analytics-umami.md). Rendered only when
// both env vars are set — absent in dev/test, so Playwright (serviceWorkers
// blocked, no Umami env) sees no script and lib/client/analytics.ts's
// track() stays a no-op.
const UMAMI_SRC = process.env.NEXT_PUBLIC_UMAMI_SRC;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

// Brand typeface (DESIGN.md §Type). Applied via sans.className on <body> —
// the var(--font-sans) indirection in globals.css failed to cascade in
// production Chromium (whole app fell back to Times New Roman; see
// fix(fonts) commit). next/font's metric-adjusted local fallback keeps
// offline test runs (Playwright, no network) flicker-safe.
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"]
});

// Absolute base for OG/Twitter URLs and sitemap/robots (strategy §0.2 #7 —
// every launch channel is link-sharing). Same validated origin the billing
// return URLs use; localhost keeps dev/test builds self-consistent.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "Revora",
  description: "General meal-composition education with cautious A1C-range context.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Revora", statusBarStyle: "default" },
  // Site-wide link-preview card; app/opengraph-image.tsx supplies the image.
  // Copy is reused from the landing page metadata — no new claims.
  openGraph: {
    siteName: "Revora",
    type: "website",
    title: "Revora — A cautious educational read on your meal",
    description:
      "For adults using a prediabetes-range A1C. Describe a meal and get general meal-composition information, cautious labels, and practical alternatives."
  },
  twitter: { card: "summary_large_image" }
};

export const viewport: Viewport = {
  themeColor: "#0d5f57",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={sans.variable}>
      <body className={sans.className}>
        {children}
        <SwRegister />
        <AttributionCapture />
        {UMAMI_SRC && UMAMI_WEBSITE_ID ? (
          <Script
            src={UMAMI_SRC}
            data-website-id={UMAMI_WEBSITE_ID}
            // PR-6: never send query strings with pageviews — URL params can
            // reveal account state (?health-data-deleted=1, ?subscribed=1).
            data-exclude-search="true"
            // PR-6: honor the browser's Do Not Track signal. The in-app
            // opt-out is the localStorage `umami.disabled` flag (Account page).
            data-do-not-track="true"
            strategy="afterInteractive"
            defer
          />
        ) : null}
      </body>
    </html>
  );
}
