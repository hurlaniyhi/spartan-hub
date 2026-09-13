import type { Metadata } from "next";
import { Images } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { getGalleryItems } from "@/lib/gallery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Team photos and videos from Spartan FC.",
};

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <div>
      <PageHero
        icon={Images}
        title="Gallery"
        subtitle="Photos and videos from Spartan FC — click any item to view or download it."
      />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <GalleryGrid items={items} />
      </div>
    </div>
  );
}
