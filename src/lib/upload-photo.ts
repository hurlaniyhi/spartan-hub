import { put, del } from "@vercel/blob";
import { randomUUID } from "crypto";

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

/**
 * Stores player photos in Vercel Blob — required since the app runs on
 * Vercel's serverless functions, which have no persistent/writable
 * filesystem. Callers only ever see the returned public URL, so swapping
 * storage providers later would only touch this file.
 */
export async function savePlayerPhoto(file: File): Promise<string> {
  if (!ALLOWED_TYPES[file.type]) {
    throw new Error("Please upload a JPG, PNG or WEBP image.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Photo must be smaller than 3MB.");
  }

  const ext = ALLOWED_TYPES[file.type];
  const filename = `players/${randomUUID()}.${ext}`;
  const blob = await put(filename, file, {
    access: "public",
    contentType: file.type,
  });
  return blob.url;
}

export async function deletePlayerPhoto(photoUrl: string | undefined | null) {
  if (!photoUrl) return;
  await del(photoUrl).catch(() => {});
}
