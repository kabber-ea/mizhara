import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { getCroppedImageFile } from "@/lib/crop-image";
import { CROP_PRESETS, type CropPreset } from "@/lib/image-upload";

type ImageCropModalProps = {
  file: File;
  preset?: CropPreset["id"];
  title?: string;
  onCancel: () => void;
  onComplete: (croppedFile: File) => void;
};

export default function ImageCropModal({
  file,
  preset = "card",
  title,
  onCancel,
  onComplete,
}: ImageCropModalProps) {
  const cropPreset = CROP_PRESETS[preset];
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const modalTitle =
    title ??
    (preset === "bannerDesktop"
      ? "Crop desktop banner"
      : preset === "bannerMobile"
        ? "Crop mobile banner"
        : "Crop image");
  const sizeLabel = `${cropPreset.outputWidth}×${cropPreset.outputHeight}`;
  const cropHeight =
    preset === "bannerDesktop" ? "9.5rem" : preset === "bannerMobile" ? "13rem" : "14rem";

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels);
  }, []);

  const handleApply = async () => {
    if (!croppedArea || !imageUrl) return;
    setSaving(true);
    try {
      const cropped = await getCroppedImageFile(
        imageUrl,
        croppedArea,
        file.name,
        cropPreset.outputWidth,
        cropPreset.outputHeight,
      );
      onComplete(cropped);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Close"
        onClick={onCancel}
        className="absolute inset-0 bg-primary-dark/50 backdrop-blur-[3px] cursor-pointer"
      />

      <div className="relative w-full max-w-md rounded-2xl overflow-hidden border border-accent-gold/20 bg-white shadow-[0_20px_60px_-20px_rgba(42,36,32,0.5)]">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border-custom/70">
          <div className="min-w-0">
            <h3 className="font-serif text-base font-bold text-primary-dark truncate">{modalTitle}</h3>
            <p className="text-[10px] text-muted-custom mt-0.5">{sizeLabel}</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="shrink-0 h-8 w-8 flex items-center justify-center rounded-full text-muted-custom hover:bg-accent-pink/40 hover:text-primary-dark transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        <div
          className="relative mx-4 mt-4 mb-3 overflow-hidden rounded-xl bg-primary-dark"
          style={{ height: cropHeight }}
        >
          {imageUrl && (
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={cropPreset.aspect}
              cropShape="rect"
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              classes={{
                cropAreaClassName: "!border-2 !border-white/90 !shadow-[0_0_0_9999px_rgba(42,36,32,0.5)]",
              }}
            />
          )}
        </div>

        <div className="flex items-center gap-2 px-4 pb-4">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => setZoom((z) => Math.max(1, Number((z - 0.1).toFixed(2))))}
            className="h-8 w-8 shrink-0 rounded-full border border-border-custom text-sm text-primary-dark hover:bg-accent-pink/30 cursor-pointer"
          >
            −
          </button>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1 accent-primary cursor-pointer"
            aria-label="Zoom"
          />
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => setZoom((z) => Math.min(3, Number((z + 0.1).toFixed(2))))}
            className="h-8 w-8 shrink-0 rounded-full border border-border-custom text-sm text-primary-dark hover:bg-accent-pink/30 cursor-pointer"
          >
            +
          </button>
        </div>

        <div className="flex gap-2 px-4 py-3 border-t border-border-custom/70 bg-background/40">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 py-2.5 text-xs font-semibold rounded-xl border border-border-custom text-primary-dark hover:bg-white disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={saving || !croppedArea}
            className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wide rounded-xl bg-primary hover:bg-primary-hover text-white disabled:bg-primary/50 shine-sweep cursor-pointer"
          >
            {saving ? "…" : "Use image"}
          </button>
        </div>
      </div>
    </div>
  );
}
