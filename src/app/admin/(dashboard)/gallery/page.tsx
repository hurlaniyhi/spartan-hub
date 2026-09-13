import { Images } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { GalleryUploader } from "@/components/gallery/GalleryUploader";
import { AdminGalleryCard } from "@/components/admin/AdminGalleryCard";
import { getGalleryItems } from "@/lib/gallery";

export const dynamic = "force-dynamic";

export default async function AdminGalleryPage() {
  const items = await getGalleryItems();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Gallery</h1>
        <p className="mt-1 text-sm text-white/50">Upload and manage team photos and videos.</p>
      </div>

      <GalleryUploader />

      {items.length === 0 ? (
        <EmptyState
          icon={Images}
          title="Nothing uploaded yet"
          description="Photos and videos you upload above will show up here, and on the public Gallery page."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <AdminGalleryCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
