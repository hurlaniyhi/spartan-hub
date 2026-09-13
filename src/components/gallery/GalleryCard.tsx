"use client";

import Image from "next/image";
import { Film } from "lucide-react";
import { Card } from "@/components/ui/Card";
import type { GalleryItemDTO } from "@/lib/gallery";

export function GalleryCard({ item, onOpen }: { item: GalleryItemDTO; onOpen: () => void }) {
  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-colors hover:border-white/20 active:scale-[0.98]"
      onClick={onOpen}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-white/5">
        {item.type === "photo" ? (
          <Image
            src={item.url}
            alt={item.caption ?? "Gallery photo"}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-cover transition-transform group-hover:scale-105"
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
      </div>
    </Card>
  );
}
