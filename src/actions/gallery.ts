"use server";

import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import { auth } from "@/auth";
import { connectToDatabase } from "@/lib/db";
import { GalleryItemModel } from "@/models/GalleryItem";
import { compressPhotoBuffer } from "@/lib/compress-photo";
import { GALLERY_PHOTO_COMPRESS_THRESHOLD_BYTES, type GalleryKind } from "@/lib/gallery-constants";
import type { ActionResult } from "@/lib/action-result";

interface CreateGalleryItemInput {
  type: GalleryKind;
  pathname: string;
  url: string;
  downloadUrl: string;
  mimeType: string;
  sizeBytes: number;
  caption?: string;
}

export async function createGalleryItem(
  input: CreateGalleryItemInput
): Promise<ActionResult<{ id: string }>> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "You must be signed in as an admin to do that." };
  }

  await connectToDatabase();

  let { url, downloadUrl, sizeBytes } = input;
  let width: number | undefined;
  let height: number | undefined;

  // Photos ≥1MB get re-encoded smaller for faster mobile loading — videos are
  // never fetched back into a function, only their reported metadata is trusted.
  if (input.type === "photo" && input.sizeBytes >= GALLERY_PHOTO_COMPRESS_THRESHOLD_BYTES) {
    try {
      const original = await fetch(input.url);
      const buffer = Buffer.from(await original.arrayBuffer());
      const compressed = await compressPhotoBuffer(buffer, input.mimeType);
      width = compressed.width;
      height = compressed.height;
      if (compressed.buffer.byteLength < sizeBytes) {
        const blob = await put(input.pathname, compressed.buffer, {
          access: "public",
          contentType: input.mimeType,
          allowOverwrite: true,
        });
        url = blob.url;
        downloadUrl = blob.downloadUrl;
        sizeBytes = compressed.buffer.byteLength;
      }
    } catch {
      // Compression is a best-effort optimization — fall back to the
      // original upload rather than losing the item entirely.
    }
  }

  const item = await GalleryItemModel.create({
    type: input.type,
    pathname: input.pathname,
    url,
    downloadUrl,
    mimeType: input.mimeType,
    sizeBytes,
    width,
    height,
    caption: input.caption,
    uploadedBy: session.user.name ?? session.user.email ?? undefined,
  });

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");

  return { success: true, data: { id: item._id.toString() } };
}

export async function deleteGalleryItem(id: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, message: "You must be signed in as an admin to do that." };
  }

  await connectToDatabase();
  const item = await GalleryItemModel.findById(id);
  if (!item) {
    return { success: false, message: "That item couldn't be found." };
  }

  await del(item.pathname).catch(() => {});
  await GalleryItemModel.findByIdAndDelete(id);

  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");

  return { success: true, data: undefined };
}
