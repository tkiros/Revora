"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { IconCheckCircle, IconHome, IconPerson } from "./icons";

/**
 * Sidebar navigation for the (app) shell (M1 dashboard plan §13: no
 * hamburger — at mobile widths the shell shows only the top bar, and this
 * nav exists solely in the >=1024px sidebar).
 */
const LINKS = [
  { href: "/home", label: "Home", icon: IconHome },
  { href: "/check", label: "Check a meal", icon: IconCheckCircle },
  { href: "/account", label: "Account", icon: IconPerson }
] as const;

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="app-nav" aria-label="Main">
      {LINKS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          className="app-navlink"
          href={href}
          aria-current={pathname === href ? "page" : undefined}
        >
          <Icon size={21} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
