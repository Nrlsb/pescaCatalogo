"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { X, Upload, Image as ImageIcon, Loader2 } from "lucide-react";
import NextImage from "next/image";

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({
  images,
  onChange,
  maxImages = 5,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      alert(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setUploading(true);
    const newImages = [...images];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("products").getPublicUrl(filePath);
        newImages.push(data.publicUrl);
      }

      onChange(newImages);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error al subir la imagen. Asegúrate de que el bucket 'products' exista y tenga permisos públicos.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (url: string) => {
    onChange(images.filter((img) => img !== url));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Imágenes del producto</label>
        <span className="text-xs text-gray-500">
          {images.length} / {maxImages} fotos
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {images.map((url, index) => (
          <div
            key={url}
            className="group relative aspect-square rounded-xl border border-gray-200 overflow-hidden bg-gray-50"
          >
            <NextImage
              src={url}
              alt={`Imagen ${index + 1}`}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            <button
              type="button"
              onClick={() => removeImage(url)}
              className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm text-red-500 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-gray-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {uploading ? (
              <Loader2 className="animate-spin" size={24} />
            ) : (
              <>
                <div className="p-2 bg-gray-50 rounded-full group-hover:bg-blue-100 transition-colors">
                  <Upload size={20} />
                </div>
                <span className="text-xs font-medium">Subir foto</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept="image/*"
        multiple
        className="hidden"
      />
      
      {images.length === 0 && !uploading && (
        <div className="flex items-center gap-2 p-4 border border-blue-100 bg-blue-50/50 rounded-lg text-blue-800">
          <ImageIcon size={18} className="text-blue-500" />
          <p className="text-xs italic">No hay imágenes. Se recomienda subir al menos una para la tienda.</p>
        </div>
      )}
    </div>
  );
}
