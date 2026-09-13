"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { UploadCloud, Image as ImageIcon, Film, Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { createGalleryItem } from "@/actions/gallery";
import {
  galleryKindForMime,
  galleryMaxBytesForKind,
  GALLERY_PHOTO_MIME_TYPES,
  GALLERY_VIDEO_MIME_TYPES,
} from "@/lib/gallery-constants";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/cn";

type QueueItem = {
  id: string;
  name: string;
  kind: "photo" | "video";
  progress: number;
  status: "uploading" | "processing" | "done" | "error";
  error?: string;
};

export function GalleryUploader() {
  const router = useRouter();
  const { showToast } = useToast();
  const [queue, setQueue] = useState<QueueItem[]>([]);

  const updateItem = (id: string, patch: Partial<QueueItem>) => {
    setQueue((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const uploadFile = async (file: File) => {
    const kind = galleryKindForMime(file.type);
    const id = `${file.name}-${Date.now()}-${Math.random()}`;

    if (!kind) {
      setQueue((current) => [
        ...current,
        { id, name: file.name, kind: "photo", progress: 0, status: "error", error: "Unsupported file type." },
      ]);
      return;
    }

    const maxBytes = galleryMaxBytesForKind(kind);
    if (file.size > maxBytes) {
      setQueue((current) => [
        ...current,
        {
          id,
          name: file.name,
          kind,
          progress: 0,
          status: "error",
          error: `Too large — max ${formatBytes(maxBytes)}.`,
        },
      ]);
      return;
    }

    setQueue((current) => [...current, { id, name: file.name, kind, progress: 0, status: "uploading" }]);

    try {
      const ext = file.name.split(".").pop() || (kind === "photo" ? "jpg" : "mp4");
      const pathname = `gallery/${kind}/${crypto.randomUUID()}.${ext}`;

      const blob = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/gallery/upload",
        contentType: file.type,
        multipart: file.size > 10 * 1024 * 1024,
        onUploadProgress: ({ percentage }) => updateItem(id, { progress: percentage }),
      });

      updateItem(id, { status: "processing", progress: 100 });

      const result = await createGalleryItem({
        type: kind,
        pathname: blob.pathname,
        url: blob.url,
        downloadUrl: blob.downloadUrl,
        mimeType: file.type,
        sizeBytes: file.size,
      });

      if (!result.success) {
        updateItem(id, { status: "error", error: result.message });
        return;
      }

      updateItem(id, { status: "done" });
      router.refresh();
    } catch (error) {
      updateItem(id, {
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed.",
      });
    }
  };

  const onFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;
    for (const file of files) {
      uploadFile(file);
    }
    showToast(`Uploading ${files.length} item${files.length > 1 ? "s" : ""}...`);
  };

  const acceptTypes = [...GALLERY_PHOTO_MIME_TYPES, ...GALLERY_VIDEO_MIME_TYPES].join(",");

  return (
    <div className="flex flex-col gap-4">
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] px-6 py-10 text-center transition-colors hover:border-brand-light hover:bg-white/5"
        )}
      >
        <div className="flex size-12 items-center justify-center rounded-full bg-white/10 text-white/70">
          <UploadCloud className="size-6" />
        </div>
        <p className="font-display text-base font-semibold text-white">Upload photos or videos</p>
        <p className="text-sm text-white/40">
          JPG, PNG, WEBP up to 15MB · MP4, MOV, WEBM up to 200MB
        </p>
        <input type="file" multiple accept={acceptTypes} className="hidden" onChange={onFilesSelected} />
        <Button type="button" variant="accent" size="sm" className="pointer-events-none mt-1">
          Choose Files
        </Button>
      </label>

      {queue.length > 0 && (
        <div className="flex flex-col gap-2">
          {queue.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white/60">
                {item.kind === "photo" ? <ImageIcon className="size-4" /> : <Film className="size-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{item.name}</p>
                {item.status === "error" ? (
                  <p className="text-xs text-red-300">{item.error}</p>
                ) : item.status === "done" ? (
                  <p className="text-xs text-emerald-300">Uploaded</p>
                ) : (
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-brand transition-[width]"
                      style={{ width: `${item.status === "processing" ? 100 : item.progress}%` }}
                    />
                  </div>
                )}
              </div>
              {item.status === "done" && <Check className="size-4 shrink-0 text-emerald-400" />}
              {item.status === "error" && <AlertCircle className="size-4 shrink-0 text-red-300" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
