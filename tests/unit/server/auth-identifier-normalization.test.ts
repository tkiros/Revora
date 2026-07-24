/**
 * WS-3 — AUD-024 (GHSA-7rqj-j65f-68wh) + AUD-006.
 *
 * The sign-in identifier is canonicalized by our own normalizer (NFKC first,
 * exactly one ASCII "@") wired into the Resend provider, independent of the
 * upgraded @auth/core's fix. And the accounts.expires_at column is a plain
 * integer — the old smallint overflowed on any realistic Unix-epoch value the
 * moment OAuth wrote one.
 */

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { normalizeSigninIdentifier } from "../../../lib/server/auth-identifier";
import { schema } from "../../../lib/server/db";
import { createTestDb } from "../../helpers/test-db";

describe("normalizeSigninIdentifier", () => {
  it("canonicalizes an ordinary address to lowercase", () => {
    expect(normalizeSigninIdentifier("  User@Example.COM ")).toBe(
      "user@example.com"
    );
  });

  it("keeps plus-addressing and dots intact", () => {
    expect(normalizeSigninIdentifier("a.b+tag@example.com")).toBe(
      "a.b+tag@example.com"
    );
  });

  // The vulnerability class: separators and look-alikes that NFKC resolves
  // AFTER the vulnerable normalizer had already split on the first ASCII "@".
  it.each([
    ["fullwidth at sign", "user＠example.com@attacker.example"],
    ["second at after NFKC", "user@example.com＠attacker.example"],
    ["double ascii at", "user@attacker.example@example.com"],
    ["no at", "userexample.com"],
    ["empty local part", "@example.com"],
    ["empty domain", "user@"],
    ["embedded whitespace", "user name@example.com"],
    ["embedded newline", "user\n@example.com"],
    ["control character", "user\u0000@example.com"],
    ["dotless domain", "user@localhost"],
    ["non-ascii domain", "user@exаmple.com"] // Cyrillic а homoglyph
  ])("rejects: %s", (_label, input) => {
    expect(() => normalizeSigninIdentifier(input)).toThrow(
      "Invalid sign-in email address."
    );
  });

  it("NFKC-normalizes compatibility forms into one canonical mailbox", () => {
    // Fullwidth letters normalize to ASCII — same mailbox, one spelling.
    expect(normalizeSigninIdentifier("ｕser@example.com")).toBe(
      "user@example.com"
    );
  });
});

describe("accounts.expires_at survives realistic epoch values (AUD-006)", () => {
  let testDb: Awaited<ReturnType<typeof createTestDb>>;

  beforeAll(async () => {
    testDb = await createTestDb();
  });

  afterAll(async () => {
    await testDb.close();
  });

  it("round-trips a 10-digit Unix timestamp unchanged", async () => {
    const [user] = await testDb.db
      .insert(schema.users)
      .values({ email: "oauth-expiry@test.dev" })
      .returning();

    const expiresAt = 1_784_000_000; // ~2026 — far beyond smallint's 32767
    await testDb.db.insert(schema.accounts).values({
      userId: user.id,
      type: "oauth",
      provider: "google",
      providerAccountId: "sub-123",
      expires_at: expiresAt
    });

    const [row] = await testDb.db
      .select({ expiresAt: schema.accounts.expires_at })
      .from(schema.accounts);
    expect(row.expiresAt).toBe(expiresAt);
  });
});
