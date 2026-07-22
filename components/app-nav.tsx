"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  IconBookmark,
  IconCheckCircle,
  IconCompass,
  IconHome,
  IconPerson
} from "./icons";

/**
 * The four-jobs navigation + the core action (C7 restructure, design-review
 * D4): Home · My meals · Check · My journey · Account. One component, two
 * renders — the ≥1024px sidebar and the <1024px bottom tab bar. The inactive
 * wrapper is `display:none` at each breakpoint (globals.css), which removes it
 * from the accessibility tree, so there is never a duplicate nav landmark.
 *
 * Active-state rules (plan §1): `aria-current="page"` on exact match only;
 * /subscribe lights Account (it is a billing surface); everything else lights
 * nothing.
 */
const LINKS = [
  { href: "/home", label: "Home", icon: IconHome },
  { href: "/meals", label: "My meals", icon: IconBookmark },
  { href: "/check", label: "Check", sidebarLabel: "Check a meal", icon: IconCheckCircle, action: true },
  { href: "/journey", label: "My journey", icon: IconCompass },
  { href: "/account", label: "Account", icon: IconPerson }
] as const;

function isActive(href: string, pathname: string): boolean {
  if (pathname === href) {
    return true;
  }
  return href === "/account" && pathname === "/subscribe";
}

export function AppNav({ variant }: { variant: "sidebar" | "tabbar" }) {
  const pathname = usePathname();

  return (
    <nav
      className={variant === "sidebar" ? "app-nav" : "app-tabbar-nav"}
      aria-label="Main"
    >
      {LINKS.map(({ href, label, icon: Icon, ...rest }) => {
        const action = "action" in rest && rest.action === true;
        const text =
          variant === "sidebar" && "sidebarLabel" in rest
            ? (rest.sidebarLabel as string)
            : label;
        return (
          <Link
            key={href}
            className={
              variant === "sidebar"
                ? "app-navlink"
                : action
                  ? "app-tab app-tab-action"
                  : "app-tab"
            }
            href={href}
            aria-current={isActive(href, pathname) ? "page" : undefined}
          >
            <Icon size={variant === "sidebar" ? 21 : 20} />
            {text}
          </Link>
        );
      })}
    </nav>
  );
}
