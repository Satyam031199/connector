/**
 * Server-side image validation.
 *
 * File type is detected from the file's magic bytes rather than the
 * client-supplied `Content-Type`, which must not be trusted.
 */

// Capped to stay under Vercel's ~4.5MB serverless request-body limit, since the
// image is uploaded through a Server Action (which routes through the server).
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024; // 4 MB
export const MAX_UPLOAD_MB = MAX_UPLOAD_BYTES / (1024 * 1024);

export type DetectedImage = {
  contentType: "image/jpeg" | "image/png" | "image/webp";
  extension: "jpg" | "png" | "webp";
};

/**
 * Inspects the leading bytes of a file and returns the canonical content type
 * and extension for supported image formats, or `null` if the bytes do not
 * match an allowed format.
 */
export function detectImageType(bytes: Uint8Array): DetectedImage | null {
  // JPEG: FF D8 FF
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { contentType: "image/jpeg", extension: "jpg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { contentType: "image/png", extension: "png" };
  }

  // WEBP: "RIFF" .... "WEBP"
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && // R
    bytes[1] === 0x49 && // I
    bytes[2] === 0x46 && // F
    bytes[3] === 0x46 && // F
    bytes[8] === 0x57 && // W
    bytes[9] === 0x45 && // E
    bytes[10] === 0x42 && // B
    bytes[11] === 0x50 // P
  ) {
    return { contentType: "image/webp", extension: "webp" };
  }

  return null;
}
