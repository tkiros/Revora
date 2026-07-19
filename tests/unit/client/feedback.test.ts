import { describe, expect, it, vi } from "vitest";

import {
  resolveFeedbackSend,
  submitResultFeedback
} from "../../../lib/client/feedback";

const CHECK_ID = "11111111-1111-4111-8111-111111111111";

function okFetch() {
  return vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }));
}

function bodyOf(mock: ReturnType<typeof okFetch>) {
  const [, init] = mock.mock.calls[0] as unknown as [string, RequestInit];
  return JSON.parse(init.body as string);
}

describe("submitResultFeedback", () => {
  it("posts a minimal positive body — no reason, no comment", async () => {
    const fetchImpl = okFetch();
    const ok = await submitResultFeedback(CHECK_ID, { helpful: true }, fetchImpl);

    expect(ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith("/api/feedback", expect.objectContaining({ method: "POST" }));
    expect(bodyOf(fetchImpl)).toEqual({ checkId: CHECK_ID, helpful: true });
  });

  it("includes the reason and trims the comment; omits an empty comment", async () => {
    const withComment = okFetch();
    await submitResultFeedback(
      CHECK_ID,
      { helpful: false, reason: "unsafe_feeling", comment: "  worried  " },
      withComment
    );
    expect(bodyOf(withComment)).toEqual({
      checkId: CHECK_ID,
      helpful: false,
      reason: "unsafe_feeling",
      comment: "worried"
    });

    const emptyComment = okFetch();
    await submitResultFeedback(
      CHECK_ID,
      { helpful: false, reason: "other", comment: "   " },
      emptyComment
    );
    expect(bodyOf(emptyComment)).toEqual({
      checkId: CHECK_ID,
      helpful: false,
      reason: "other"
    });
  });

  it("fails soft — resolves false on a network throw", async () => {
    const throwing = vi.fn(async () => {
      throw new Error("offline");
    });
    const ok = await submitResultFeedback(CHECK_ID, { helpful: true }, throwing);
    expect(ok).toBe(false);
  });

  it("resolves false on a non-ok response", async () => {
    const failing = vi.fn(async () => new Response("nope", { status: 500 }));
    const ok = await submitResultFeedback(CHECK_ID, { helpful: true }, failing);
    expect(ok).toBe(false);
  });
});

describe("resolveFeedbackSend — SAFETY report success/failure decision (U1)", () => {
  it("advances to the acknowledgment only when the POST succeeded", () => {
    expect(resolveFeedbackSend(true)).toEqual({ step: "done", failed: false });
  });

  it("keeps the reason view and flags failure when the POST failed — never a false 'Noted.'", () => {
    expect(resolveFeedbackSend(false)).toEqual({
      step: "reason",
      failed: true
    });
  });
});
