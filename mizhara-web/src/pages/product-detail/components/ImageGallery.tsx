import { useState } from "react";

interface ImageGalleryProps {
  images: string[];
  name: string;
  category: string;
}

export default function ImageGallery({ images, name }: ImageGalleryProps) {
  const gallery = images?.length ? images : [];
  const [active, setActive] = useState(0);
  const current = gallery[active];

  return (
    <div className="space-y-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-border-custom bg-accent-pink/10">
        {current ? (
          <img src={current} alt={name} className="object-cover w-full h-full" />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">✨</div>
        )}
        <div className="absolute top-4 right-4 animate-sparkle-pulse text-accent-gold text-xl">✦</div>
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-4">
          {gallery.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 rounded-xl overflow-hidden border-2 transition-colors cursor-pointer ${active === i ? "border-primary" : "border-border-custom"}`}
            >
              <img src={img} alt="" className="object-cover w-full h-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
