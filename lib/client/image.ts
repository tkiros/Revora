const DEFAULT_MAX_EDGE = 1024;
const JPEG_QUALITY = 0.8;

export function targetDimensions(
  width: number,
  height: number,
  maxEdge: number
): { width: number; height: number } {
  const longEdge = Math.max(width, height);
  if (longEdge <= maxEdge) {
    return { width, height };
  }
  const scale = maxEdge / longEdge;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/** Downscale a camera File to a JPEG data URL (≤ maxEdgePx on the long edge).
 *  Keeps request bodies small and vision token cost bounded. Browser-only. */
export async function fileToDataUrl(
  file: File,
  maxEdgePx: number = DEFAULT_MAX_EDGE
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = targetDimensions(bitmap.width, bitmap.height, maxEdgePx);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas 2D context unavailable.");
    }
    context.drawImage(bitmap, 0, 0, width, height);
    return canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}
