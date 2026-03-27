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
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Variante:</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v.id)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selectedVariant === v.id
                    ? "border-blue-700 bg-blue-50 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:border-gray-400"
                }`}
              >
                {v.name}
                {v.price_delta !== 0 && (
                  <span className="ml-1 text-xs text-gray-500">
                    ({v.price_delta > 0 ? "+" : ""}{v.price_delta})
                  </span>
                )}
              </button>
            ))}
          </div>
          {variants.length > 0 && !selectedVariant && (
            <p className="text-xs text-red-500 mt-1">Seleccioná una variante</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex items-center border border-gray-300 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
          >
            -
          </button>
          <span className="px-4 py-2 font-medium text-gray-800 min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
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
