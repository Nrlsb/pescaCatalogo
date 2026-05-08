"use client";

import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/Button";

interface Variant {
  id: string;
  name: string;
  price_delta: number;
}

interface Props {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    sku?: string | null;
  };
  variants: Variant[];
  outOfStock: boolean;
}

export default function AddToCartButton({ product, variants, outOfStock }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = variants.find((v) => v.id === selectedVariant);
  const finalPrice = product.price + (variant?.price_delta ?? 0);

  const handleAdd = () => {
    if (variants.length > 0 && !selectedVariant) return;
    addItem({
      productId: product.id,
      variantId: selectedVariant ?? undefined,
      name: product.name,
      variantName: variant?.name,
      price: finalPrice,
      quantity,
      image: product.image,
      sku: product.sku ?? undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-4">
      {variants.length > 0 && (
        <div className="animate-in" style={{ animationDelay: '100ms' }}>
          <p className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-3 flex items-center gap-2">
            Seleccionar Variante
          </p>
          <div className="flex flex-wrap gap-3">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v.id)}
                className={`px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all duration-200 ${
                  selectedVariant === v.id
                    ? "border-primary bg-primary/5 text-primary shadow-sm"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                {v.name}
                {v.price_delta !== 0 && (
                  <span className={`ml-2 text-xs ${selectedVariant === v.id ? "text-primary/70" : "text-slate-400"}`}>
                    ({v.price_delta > 0 ? "+" : ""}{v.price_delta})
                  </span>
                )}
              </button>
            ))}
          </div>
          {variants.length > 0 && !selectedVariant && (
            <p className="text-xs text-rose-500 font-medium mt-2 flex items-center gap-1">
              <span className="w-1 h-1 bg-rose-500 rounded-full animate-pulse" />
              Por favor, seleccioná una variante
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm active:scale-95"
          >
            -
          </button>
          <span className="flex-1 px-4 font-bold text-slate-900 dark:text-white text-center min-w-[3rem]">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all shadow-sm active:scale-95"
          >
            +
          </button>
        </div>


        <Button
          onClick={handleAdd}
          disabled={outOfStock || (variants.length > 0 && !selectedVariant)}
          size="lg"
          className="flex-1"
        >
          {added ? (
            "¡Agregado!"
          ) : (
            <>
              <ShoppingCart size={20} />
              {outOfStock ? "Sin stock" : "Agregar al carrito"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
