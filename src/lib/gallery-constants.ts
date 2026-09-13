export const GALLERY_PHOTO_MAX_BYTES = 15 * 1024 * 1024;
export const GALLERY_VIDEO_MAX_BYTES = 200 * 1024 * 1024;
export const GALLERY_PHOTO_COMPRESS_THRESHOLD_BYTES = 1 * 1024 * 1024;

export const GALLERY_PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const GALLERY_VIDEO_MIME_TYPES = ["video/mp4", "video/quicktime", "video/webm"] as const;

export type GalleryKind = "photo" | "video";

export function galleryKindForMime(mimeType: string): GalleryKind | null {
  if ((GALLERY_PHOTO_MIME_TYPES as readonly string[]).includes(mimeType)) return "photo";
  if ((GALLERY_VIDEO_MIME_TYPES as readonly string[]).includes(mimeType)) return "video";
  return null;
}

export function galleryMaxBytesForKind(kind: GalleryKind): number {
  return kind === "photo" ? GALLERY_PHOTO_MAX_BYTES : GALLERY_VIDEO_MAX_BYTES;
}
