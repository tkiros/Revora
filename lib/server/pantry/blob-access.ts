import { Buffer } from "node:buffer";

import type { GetBlobResult, GetCommandOptions } from "@vercel/blob";

export const PANTRY_BLOB_ACCESS = "private" as const;
export const MAX_PANTRY_PHOTO_BYTES = 5 * 1024 * 1024;

const PRIVATE_BLOB_HOST =
  /^[a-z0-9-]+\.private\.blob\.vercel-storage\.com$/;
const RANDOMIZED_PHOTO_NAME = /^photo-[A-Za-z0-9_-]{8,}\.jpg$/;
const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

type BlobGetter = (
  urlOrPathname: string,
  options: GetCommandOptions
) => Promise<GetBlobResult | null>;

export function pantryBlobToken(env: NodeJS.ProcessEnv = process.env): string {
  const token = env.PANTRY_BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error("PANTRY_BLOB_READ_WRITE_TOKEN is required.");
  }
  return token;
}

export function isPrivatePantryBlobUrlForOrder(
  value: string,
  orderId: string
): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !PRIVATE_BLOB_HOST.test(url.hostname)) {
      return false;
    }
    if (url.username || url.password || url.port || url.search || url.hash) {
      return false;
    }

    const segments = url.pathname.split("/");
    return (
      segments.length === 4 &&
      segments[0] === "" &&
      segments[1] === "pantry" &&
      segments[2] === orderId &&
      RANDOMIZED_PHOTO_NAME.test(segments[3])
    );
  } catch {
    return false;
  }
}

async function defaultGetBlob(
  urlOrPathname: string,
  options: GetCommandOptions
) {
  const { get } = await import("@vercel/blob");
  return get(urlOrPathname, options);
}

async function readBoundedStream(
  stream: ReadableStream<Uint8Array>,
  maxBytes: number
): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Buffer[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new Error("Pantry photo exceeds the size limit.");
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  return Buffer.concat(chunks, totalBytes);
}

/**
 * Authenticated private-store read for the vision boundary. The Blob URL and
 * credential stay server-side; OpenAI receives only an in-memory data URL.
 */
export async function readPrivatePantryPhotoDataUrl(
  photoUrl: string,
  options: {
    token?: string;
    getBlob?: BlobGetter;
    timeoutMs?: number;
  } = {}
): Promise<string> {
  let parsed: URL;
  try {
    parsed = new URL(photoUrl);
  } catch {
    throw new Error("Invalid private Pantry photo URL.");
  }
  if (parsed.protocol !== "https:" || !PRIVATE_BLOB_HOST.test(parsed.hostname)) {
    throw new Error("Invalid private Pantry photo URL.");
  }

  const getBlob = options.getBlob ?? defaultGetBlob;
  const result = await getBlob(photoUrl, {
    access: PANTRY_BLOB_ACCESS,
    token: options.token ?? pantryBlobToken(),
    abortSignal: AbortSignal.timeout(options.timeoutMs ?? 30_000)
  });

  if (!result || result.statusCode !== 200 || result.blob.url !== photoUrl) {
    throw new Error("Private Pantry photo was not found.");
  }
  if (
    !Number.isSafeInteger(result.blob.size) ||
    result.blob.size <= 0 ||
    result.blob.size > MAX_PANTRY_PHOTO_BYTES
  ) {
    throw new Error("Pantry photo exceeds the size limit.");
  }

  const contentType = result.blob.contentType
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
  if (!ALLOWED_PHOTO_TYPES.has(contentType)) {
    throw new Error("Unsupported Pantry photo type.");
  }

  const bytes = await readBoundedStream(
    result.stream,
    MAX_PANTRY_PHOTO_BYTES
  );
  if (bytes.length === 0) {
    throw new Error("Private Pantry photo was empty.");
  }

  return `data:${contentType};base64,${bytes.toString("base64")}`;
}
