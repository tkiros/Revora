import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { decryptField, encryptField } from "../../../lib/server/crypto";

const TEST_KEY = Buffer.alloc(32, 7).toString("base64");

beforeEach(() => {
  process.env.HEALTH_DATA_KEY = TEST_KEY;
});

afterEach(() => {
  delete process.env.HEALTH_DATA_KEY;
});

describe("field encryption (AES-256-GCM)", () => {
  it("round-trips plaintext", () => {
    const cipher = encryptField("6.2");

    expect(cipher).not.toContain("6.2");
    expect(decryptField(cipher)).toBe("6.2");
  });

  it("round-trips long unicode food descriptions", () => {
    const food = "café au lait — croissant aux amandes, ~1 cup 🥐";

    expect(decryptField(encryptField(food))).toBe(food);
  });

  it("produces a fresh IV per call — same plaintext, different ciphertext", () => {
    expect(encryptField("oatmeal")).not.toBe(encryptField("oatmeal"));
  });

  it("fails closed on tampered ciphertext", () => {
    const cipher = encryptField("6.2");
    const raw = Buffer.from(cipher, "base64");
    raw[raw.length - 1] ^= 0xff; // flip a ciphertext bit
    const tampered = raw.toString("base64");

    expect(() => decryptField(tampered)).toThrow();
  });

  it("fails closed on truncated payloads", () => {
    expect(() => decryptField("dG9vc2hvcnQ=")).toThrow();
  });

  it("throws a clear error when HEALTH_DATA_KEY is missing", () => {
    delete process.env.HEALTH_DATA_KEY;

    expect(() => encryptField("6.2")).toThrow(/HEALTH_DATA_KEY/);
  });

  it("throws a clear error when the key is not 32 bytes", () => {
    process.env.HEALTH_DATA_KEY = Buffer.alloc(16, 1).toString("base64");

    expect(() => encryptField("6.2")).toThrow(/32/);
  });
});
