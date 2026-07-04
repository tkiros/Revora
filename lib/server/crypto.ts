import {
  createCipheriv,
  createDecipheriv,
  randomBytes
} from "node:crypto";

/**
 * Column-level encryption for special-category fields (exact A1C, food text)
 * — GDPR Art. 9 posture per docs/adr/stack.md. AES-256-GCM with a fresh IV
 * per value; payload = base64(iv || authTag || ciphertext).
 * ponytail: env-key AES-GCM via node:crypto; upgrade path = KMS/managed keys
 * if compliance posture demands.
 */

const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function loadKey(): Buffer {
  const raw = process.env.HEALTH_DATA_KEY;

  if (!raw) {
    throw new Error(
      "HEALTH_DATA_KEY is not set — refusing to handle health data unencrypted."
    );
  }

  const key = Buffer.from(raw, "base64");
  if (key.length !== KEY_LENGTH) {
    throw new Error("HEALTH_DATA_KEY must be 32 bytes, base64-encoded.");
  }

  return key;
}

export function encryptField(plain: string): string {
  const key = loadKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final()
  ]);

  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString(
    "base64"
  );
}

export function decryptField(payload: string): string {
  const key = loadKey();
  const raw = Buffer.from(payload, "base64");

  if (raw.length < IV_LENGTH + TAG_LENGTH) {
    throw new Error("Encrypted payload is too short to be valid.");
  }

  const iv = raw.subarray(0, IV_LENGTH);
  const tag = raw.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = raw.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([
    decipher.update(ciphertext),
    decipher.final()
  ]).toString("utf8");
}
