"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { historyStore } from "../lib/client/history-store";
import { profileStore } from "../lib/client/profile-store";
import { tasterStore } from "../lib/client/taster-store";

// First-run redirect (handoff §1): a brand-new visitor auto-enters the tour.
// Any prior signal (a check, a saved A1C, a started taster) means "not new",
// and ?stay=1 is the deliberate escape hatch onboarding's "skip" uses so
// skipping doesn't loop. Pure so the truth table is unit-testable in node.
export function isFirstRun(
  historyLen: number,
  profile: unknown,
  taster: unknown,
  stayParam: string | null
): boolean {
  const isNew = historyLen === 0 && profile === null && taster === null;
  return isNew && stayParam !== "1";
}

export function FirstRunGate() {
  const router = useRouter();

  useEffect(() => {
    const stayParam = new URLSearchParams(window.location.search).get("stay");
    if (
      isFirstRun(
        historyStore.all().length,
        profileStore.get(),
        tasterStore.get(),
        stayParam
      )
    ) {
      router.replace("/onboarding");
    }
  }, [router]);

  return null;
}
