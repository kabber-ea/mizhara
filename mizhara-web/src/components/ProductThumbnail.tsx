import { useState } from "react";

type ProductThumbnailProps = {
  src?: string;
  alt: string;
  category?: string;
  className?: string;
};

export default function ProductThumbnail({ src, alt, category, className = "h-11 w-11" }: ProductThumbnailProps) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <div
        className={`${className} rounded-lg overflow-hidden border border-rose-200 bg-rose-50 shrink-0 flex items-center justify-center`}
        title="Image required"
      >
        <span className="text-[8px] font-bold uppercase text-rose-500 text-center leading-tight px-1">
          No image
        </span>
      </div>
    );
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden border border-border-custom bg-accent-pink/10 shrink-0`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="h-full w-full object-cover"
        onError={() => setBroken(true)}
      />
    </div>
  );
}
