"use client";

import React, { useState } from "react";
import Image from "next/image";

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
          <Image
            src={current}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
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
              className={`relative flex-1 aspect-square rounded-xl border overflow-hidden ${
                i === active ? "ring-2 ring-primary border-transparent" : "border-border-custom"
              }`}
            >
              <Image src={img} alt={`${name} ${i + 1}`} fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
