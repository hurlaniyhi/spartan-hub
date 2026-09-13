import { connectToDatabase } from "@/lib/db";
import { GalleryItemModel } from "@/models/GalleryItem";
import type { GalleryKind } from "@/lib/gallery-constants";

export interface GalleryItemDTO {
  id: string;
  type: GalleryKind;
  url: string;
  downloadUrl: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
  caption?: string;
  uploadedBy?: string;
  createdAt: Date;
}

export async function getGalleryItems(): Promise<GalleryItemDTO[]> {
  await connectToDatabase();
  const items = await GalleryItemModel.find().sort({ createdAt: -1 }).lean();

  return items.map((item) => ({
    id: item._id.toString(),
    type: item.type as GalleryKind,
    url: item.url,
    downloadUrl: item.downloadUrl,
    mimeType: item.mimeType,
    sizeBytes: item.sizeBytes,
    width: item.width ?? undefined,
    height: item.height ?? undefined,
    caption: item.caption ?? undefined,
    uploadedBy: item.uploadedBy ?? undefined,
    createdAt: item.createdAt,
  }));
}
