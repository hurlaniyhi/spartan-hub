"use client";

import { useEffect } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { GalleryItemDTO } from "@/lib/gallery";

export function GalleryLightbox({ item, onClose }: { item: GalleryItemDTO | null; onClose: () => void }) {
  useEffect(() => {
    if (!item) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <button aria-label="Close" className="absolute inset-0" onClick={onClose} tabIndex={-1} />
      <div className="relative z-10 flex max-h-full max-w-4xl flex-col items-center gap-4">
        <div className="max-h-[75vh] overflow-hidden rounded-2xl border border-white/10 bg-black">
          {item.type === "photo" ? (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded media, not a static asset
            <img
              src={item.url}
              alt={item.caption ?? "Gallery photo"}
              className="max-h-[75vh] w-auto max-w-full object-contain"
            />
          ) : (
            <video src={item.url} controls autoPlay className="max-h-[75vh] w-auto max-w-full" />
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button
            href={item.downloadUrl}
            native
            download
            variant="accent"
            leftIcon={<Download className="size-4" />}
          >
            Download
          </Button>
          <Button type="button" variant="outline" leftIcon={<X className="size-4" />} onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
