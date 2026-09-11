"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { ZoomIn } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { getCroppedImageBlob } from "@/lib/crop-image";

export function PhotoCropModal({
  imageSrc,
  onCancel,
  onConfirm,
}: {
  imageSrc: string;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((_croppedArea: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSave = async () => {
    if (!croppedAreaPixels) return;
    setSaving(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open onClose={onCancel} title="Position the Photo">
      <p className="mb-3 -mt-2 text-sm text-gray-500">
        Drag to reposition, use the slider to zoom. The circle shows exactly what players will see.
      </p>

      <div className="relative h-72 w-full overflow-hidden rounded-xl bg-gray-900 sm:h-80">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <ZoomIn className="size-4 shrink-0 text-gray-400" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-200 accent-brand"
          aria-label="Zoom"
        />
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Button type="button" variant="accent" size="md" onClick={handleSave} loading={saving}>
          Use This Photo
        </Button>
        <Button type="button" variant="outline" size="md" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
