import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { SwRegister } from "../components/sw-register";

import "./globals.css";

export const metadata: Metadata = {
  title: "Revora",
  description: "Server-side permission-first food checks for prediabetes-range A1C inputs.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Revora", statusBarStyle: "default" }
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
