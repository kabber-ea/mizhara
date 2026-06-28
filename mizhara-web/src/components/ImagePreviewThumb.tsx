type ImagePreviewThumbProps = {
  src: string;
  alt?: string;
  onRemove?: () => void;
  variant?: "square" | "wide" | "tall";
  pending?: boolean;
};

export default function ImagePreviewThumb({
  src,
  alt = "",
  onRemove,
  variant = "square",
  pending = false,
}: ImagePreviewThumbProps) {
  const sizeClass =
    variant === "wide" ? "h-16 w-32" : variant === "tall" ? "h-20 w-[4.5rem]" : "h-16 w-16";

  return (
    <div
      className={`relative overflow-hidden rounded-lg border ${sizeClass} ${
        pending ? "border-primary/30 ring-1 ring-primary/20" : "border-border-custom"
      }`}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove image"
          className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-dark/75 text-white text-[10px] font-bold hover:bg-primary-dark transition-colors cursor-pointer"
        >
          ×
        </button>
      )}
    </div>
  );
}
