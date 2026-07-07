import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";

import { SwRegister } from "../components/sw-register";

import "./globals.css";

// Umami analytics (plan P7; docs/adr/analytics-umami.md). Rendered only when
// both env vars are set — absent in dev/test, so Playwright (serviceWorkers
// blocked, no Umami env) sees no script and lib/client/analytics.ts's
// track() stays a no-op.
const UMAMI_SRC = process.env.NEXT_PUBLIC_UMAMI_SRC;
const UMAMI_WEBSITE_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

// Brand typeface (DESIGN.md §Type). display:swap + Arial fallback in
// globals.css keep offline test runs (Playwright, no network) flicker-safe.
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"]
});

export const metadata: Metadata = {
  title: "Revora",
  description: "Server-side permission-first food checks for prediabetes-range A1C inputs.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Revora", statusBarStyle: "default" }
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
      <body>
        {children}
        <SwRegister />
        {UMAMI_SRC && UMAMI_WEBSITE_ID ? (
          <Script
            src={UMAMI_SRC}
            data-website-id={UMAMI_WEBSITE_ID}
            strategy="afterInteractive"
            defer
          />
        ) : null}
      </body>
    </html>
  );
}
