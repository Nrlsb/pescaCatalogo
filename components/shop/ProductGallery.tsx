"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
  name: string;
}

export default function ProductGallery({ images, name }: ProductGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-premium flex items-center justify-center text-slate-400">
        Sin imagen
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-premium group">
        <Image
          src={images[selectedImage]}
          alt={name}
          fill
          className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedImage(i)}
              className={`relative h-24 w-24 flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl overflow-hidden border transition-all duration-200 shadow-sm ${
                selectedImage === i 
                  ? "border-primary ring-2 ring-primary/20 scale-95" 
                  : "border-slate-200 dark:border-slate-800 hover:border-primary/50"
              }`}
            >
              <Image 
                src={img} 
                alt={`${name} ${i + 1}`} 
                fill 
                className="object-cover p-2" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
