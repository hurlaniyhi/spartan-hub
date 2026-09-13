"use client";

import { useState } from "react";
import { Images } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { GalleryCard } from "@/components/gallery/GalleryCard";
import { GalleryLightbox } from "@/components/gallery/GalleryLightbox";
import type { GalleryItemDTO } from "@/lib/gallery";

export function GalleryGrid({ items }: { items: GalleryItemDTO[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const openItem = items.find((item) => item.id === openId) ?? null;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Images}
        title="The gallery is empty"
        description="Team photos and videos will appear here once the admin uploads them."
      />
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <GalleryCard key={item.id} item={item} onOpen={() => setOpenId(item.id)} />
        ))}
      </div>
      <GalleryLightbox item={openItem} onClose={() => setOpenId(null)} />
    </>
  );
}
