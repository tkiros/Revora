import Link from "next/link";
import type { ReactNode } from "react";

import { AppNav } from "../../components/app-nav";
import { IconCheck, IconPerson } from "../../components/icons";
import { PlanBox } from "../../components/plan-box";
import { getPlanBox } from "../../lib/server/plan-box";

/**
 * The (app) shell (M1 dashboard plan). Nested inside the root layout —
 * NEVER a second root layout (route-group remount footgun). Below 1024px:
 * top bar (brand + Account, no hamburger — decision #13); from 1024px:
 * fixed sidebar with nav + plan box. Route-group pages keep their URLs.
 */
export default async function AppShellLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  const planBox = await getPlanBox();

  return (
    <div className="app-root">
      <a href="#app-content" className="app-skip">
        Skip to content
      </a>

      <aside className="app-sidebar">
        <div className="app-brand">
          <span className="app-brand-mark">
            <IconCheck size={17} />
          </span>
          <span>Revora</span>
        </div>
        <AppNav />
        <div className="app-sidebar-foot">
          <PlanBox data={planBox} />
        </div>
      </aside>

      <header className="app-topbar">
        <div className="app-brand">
          <span className="app-brand-mark">
            <IconCheck size={17} />
          </span>
          <span>Revora</span>
        </div>
        <Link className="app-topbar-account" href="/account">
          <IconPerson size={18} />
          Account
        </Link>
      </header>

      <main className="app-content" id="app-content" tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
