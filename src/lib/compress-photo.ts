import sharp from "sharp";

const MAX_WIDTH = 1920;
const QUALITY = 82;

/**
 * Re-encodes a photo at a capped width and quality, for faster mobile
 * loading. Only called for photos already ≥1MB — small ones are left alone.
 */
export async function compressPhotoBuffer(
  buffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; width?: number; height?: number }> {
  const image = sharp(buffer).rotate().resize({ width: MAX_WIDTH, withoutEnlargement: true });

  const encoded =
    mimeType === "image/png"
      ? image.png({ quality: QUALITY })
      : mimeType === "image/webp"
        ? image.webp({ quality: QUALITY })
        : image.jpeg({ quality: QUALITY, mozjpeg: true });

  const { data, info } = await encoded.toBuffer({ resolveWithObject: true });
  return { buffer: data, width: info.width, height: info.height };
}
