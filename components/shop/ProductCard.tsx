"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { useCartStore } from "@/store/cartStore";
import type { Product } from "@/types/database";
import Badge from "@/components/ui/Badge";

interface ProductCardProps {
  product: Product & { stock_status?: string; total_stock?: number };
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.images[0],
      sku: product.sku ?? undefined,
    });
  };

  const isOutOfStock = product.stock_status === "out_of_stock";
  const isLowStock = product.stock_status === "low_stock";

  return (
    <Link href={`/shop/${product.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        {/* Image */}
        <div className="relative h-52 bg-gray-100">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 text-sm">
              Sin imagen
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.is_featured && (
              <Badge color="blue">Destacado</Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge color="yellow">Últimas unidades</Badge>
            )}
            {isOutOfStock && (
              <Badge color="red">Sin stock</Badge>
            )}
          </div>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <div className="absolute top-2 right-2">
              <Badge color="orange">
                -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
              </Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          {product.brand && (
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              {product.brand}
            </p>
          )}
          <h3 className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-3">
            <div>
              <span className="text-base font-bold text-gray-900">
                {formatCurrency(product.price)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-xs text-gray-400 line-through ml-2">
                  {formatCurrency(product.compare_at_price)}
                </span>
              )}
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="p-2 rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Agregar al carrito"
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
