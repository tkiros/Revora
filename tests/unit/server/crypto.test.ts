import { createCipheriv, randomBytes } from "node:crypto";

import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  DecryptError,
  UNREADABLE_PLACEHOLDER,
  decryptField,
  encryptField,
  safeDecrypt
} from "../../../lib/server/crypto";

const KEY_1 = Buffer.alloc(32, 7);
const KEY_2 = Buffer.alloc(32, 9);
const b64 = (key: Buffer) => key.toString("base64");

/** A pre-versioning payload: base64(iv || authTag || ciphertext), no marker.
 *  This is what every row written before W-34 looks like — live user data, so
 *  reading it back is a hard requirement, not a nicety. */
function legacyEncrypt(plain: string, key: Buffer): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final()
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString("base64");
}

/** Flip a bit in the ciphertext body, preserving any version marker. */
function tamper(payload: string): string {
  const separator = payload.indexOf(":");
  const marker = separator > 0 ? payload.slice(0, separator + 1) : "";
  const raw = Buffer.from(payload.slice(marker.length), "base64");
  raw[raw.length - 1] ^= 0xff;
  return `${marker}${raw.toString("base64")}`;
}

beforeEach(() => {
  process.env.HEALTH_DATA_KEY = b64(KEY_1);
});

afterEach(() => {
  delete process.env.HEALTH_DATA_KEY;
  delete process.env.HEALTH_DATA_KEY_VERSION;
  delete process.env.HEALTH_DATA_KEYS_OLD;
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
    expect(() => decryptField(tamper(encryptField("6.2")))).toThrow();
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

describe("key versioning and rotation (N-26)", () => {
  it("stamps new payloads with the key version", () => {
    expect(encryptField("6.2").startsWith("v1:")).toBe(true);

    process.env.HEALTH_DATA_KEY_VERSION = "2";
    expect(encryptField("6.2").startsWith("v2:")).toBe(true);
  });

  it("decrypts OLD unversioned payloads written before versioning existed", () => {
    expect(decryptField(legacyEncrypt("6.1", KEY_1))).toBe("6.1");
  });

  it("decrypts unversioned payloads with a RETIRED key after rotation", () => {
    const legacy = legacyEncrypt("6.1", KEY_1);

    // Rotate: key 2 is now primary, key 1 is decrypt-only.
    process.env.HEALTH_DATA_KEY = b64(KEY_2);
    process.env.HEALTH_DATA_KEY_VERSION = "2";
    process.env.HEALTH_DATA_KEYS_OLD = `1:${b64(KEY_1)}`;

    expect(decryptField(legacy)).toBe("6.1");
    expect(decryptField(encryptField("6.3"))).toBe("6.3"); // new rows still fine
  });

  it("decrypts a v1 payload after rotating to v2 — the point of the version", () => {
    const written = encryptField("6.2");

    process.env.HEALTH_DATA_KEY = b64(KEY_2);
    process.env.HEALTH_DATA_KEY_VERSION = "2";
    process.env.HEALTH_DATA_KEYS_OLD = `1:${b64(KEY_1)}`;

    expect(decryptField(written)).toBe("6.2");
  });

  it("reports a dropped key version as rotation loss, NOT tampering", () => {
    const written = encryptField("6.2"); // v1

    // Rotated to v2 and the old key was NOT kept in the keyring.
    process.env.HEALTH_DATA_KEY = b64(KEY_2);
    process.env.HEALTH_DATA_KEY_VERSION = "2";

    try {
      decryptField(written);
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DecryptError);
      expect((error as DecryptError).reason).toBe("unknown_key");
    }
  });

  it("reports a modified ciphertext as tampering — distinguishable from rotation", () => {
    try {
      decryptField(tamper(encryptField("6.2")));
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(DecryptError);
      expect((error as DecryptError).reason).toBe("tampered");
    }
  });

  it("reports a garbage payload as malformed", () => {
    try {
      decryptField("dG9vc2hvcnQ=");
      throw new Error("should have thrown");
    } catch (error) {
      expect((error as DecryptError).reason).toBe("malformed");
    }
  });

  it("never lets a retired key shadow the key we encrypt with", () => {
    process.env.HEALTH_DATA_KEYS_OLD = `1:${b64(KEY_2)}`; // same version as primary

    expect(decryptField(encryptField("6.2"))).toBe("6.2");
  });

  it("rejects a non-integer key version rather than guessing", () => {
    process.env.HEALTH_DATA_KEY_VERSION = "latest";

    expect(() => encryptField("6.2")).toThrow(/HEALTH_DATA_KEY_VERSION/);
  });
});

describe("safeDecrypt", () => {
  it("returns the plaintext when the payload is readable", () => {
    expect(safeDecrypt(encryptField("oatmeal"))).toBe("oatmeal");
  });

  it("degrades to a placeholder on rotation loss instead of taking the page down", () => {
    const written = encryptField("oatmeal");
    process.env.HEALTH_DATA_KEY = b64(KEY_2);
    process.env.HEALTH_DATA_KEY_VERSION = "2";

    expect(safeDecrypt(written)).toBe(UNREADABLE_PLACEHOLDER);
  });

  it("degrades to a placeholder on tampering too — the user sees calm, Sentry sees loud", () => {
    expect(safeDecrypt(tamper(encryptField("oatmeal")))).toBe(
      UNREADABLE_PLACEHOLDER
    );
  });
});
