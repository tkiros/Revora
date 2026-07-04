/**
 * Client-side photo prep: decode (browser applies EXIF orientation; Safari
 * decodes HEIC natively), downscale to ~1600px, re-encode as JPEG. This is
 * the whole HEIC/EXIF strategy — the server only ever sees oriented JPEGs
 * ≤5MB. A file the browser cannot decode (e.g. HEIC on desktop Chrome)
 * rejects, and the picker shows a per-photo field-error with retry.
 */

export function fitWithin(
  width: number,
  height: number,
  maxDim: number
): { width: number; height: number } {
  const scale = Math.min(1, maxDim / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

export async function downscaleToJpeg(file: File, maxDim = 1600): Promise<Blob> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image"
  });
  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxDim);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable.");
  context.drawImage(bitmap, 0, 0, width, height);
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Encode failed."))),
      "image/jpeg",
      0.85
    );
  });
}
