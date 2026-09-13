"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Film, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { GalleryLightbox } from "@/components/gallery/GalleryLightbox";
import { deleteGalleryItem } from "@/actions/gallery";
import { formatBytes } from "@/lib/format";
import type { GalleryItemDTO } from "@/lib/gallery";

export function AdminGalleryCard({ item }: { item: GalleryItemDTO }) {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteGalleryItem(item.id);
      if (!result.success) {
        showToast(result.message, "error");
        return;
      }
      setConfirmOpen(false);
      showToast("Item deleted.");
    });
  };

  return (
    <>
      <Card className="overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative block aspect-square w-full overflow-hidden bg-white/5"
        >
          {item.type === "photo" ? (
            <Image
              src={item.url}
              alt={item.caption ?? "Gallery photo"}
              fill
              sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
            />
          ) : (
            <video src={item.url} preload="metadata" className="size-full object-cover" muted />
          )}
          {item.type === "video" && (
            <span className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
              <Film className="size-3" />
              Video
            </span>
          )}
        </button>
        <div className="flex items-center justify-between gap-2 p-3">
          <span className="text-xs text-white/40">{formatBytes(item.sizeBytes)}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            leftIcon={<Trash2 className="size-3.5" />}
          >
            Delete
          </Button>
        </div>
      </Card>

      <GalleryLightbox item={open ? item : null} onClose={() => setOpen(false)} />

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Delete this item?">
        <p className="mb-5 text-sm text-white/60">
          This permanently removes it from the gallery for everyone. This can&apos;t be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={handleDelete} loading={pending}>
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
