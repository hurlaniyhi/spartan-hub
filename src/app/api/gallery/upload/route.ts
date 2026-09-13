import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { requireAdmin } from "@/lib/require-admin";
import {
  galleryMaxBytesForKind,
  GALLERY_PHOTO_MIME_TYPES,
  GALLERY_VIDEO_MIME_TYPES,
} from "@/lib/gallery-constants";

export async function POST(request: Request) {
  const { unauthorized } = await requireAdmin();
  if (unauthorized) return unauthorized;

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const isVideo = pathname.startsWith("gallery/video/");
        const kind = isVideo ? "video" : "photo";
        return {
          allowedContentTypes: isVideo
            ? [...GALLERY_VIDEO_MIME_TYPES]
            : [...GALLERY_PHOTO_MIME_TYPES],
          maximumSizeInBytes: galleryMaxBytesForKind(kind),
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 }
    );
  }
}
