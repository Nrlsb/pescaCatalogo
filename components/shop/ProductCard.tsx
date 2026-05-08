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
    <Link href={`/shop/${product.slug}`} className="group block h-full">
      <div className="flex flex-col h-full bg-card text-card-foreground rounded-2xl border border-gray-100 overflow-hidden hover:shadow-premium-hover transition-all duration-500 hover:-translate-y-2">
        {/* Image */}
        <div className="relative aspect-[4/5] bg-[#fcfcfc]">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[10px] uppercase tracking-widest font-bold bg-gray-50">
              Sin imagen
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {product.is_featured && (
              <Badge color="blue" size="sm" className="font-bold tracking-widest uppercase text-[10px]">Premium</Badge>
            )}
            {isOutOfStock && (
              <Badge color="red" size="sm" className="font-bold tracking-widest uppercase text-[10px]">Agotado</Badge>
            )}
          </div>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <div className="absolute top-4 right-4">
              <Badge color="orange" size="sm" className="font-bold">
                -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
              </Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-6 flex flex-col flex-1 gap-1">
          {product.brand && (
            <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em] mb-1">
              {product.brand}
            </p>
          )}
          <h3 className="font-serif text-lg text-foreground line-clamp-1 leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-6">
            <div className="flex flex-col">
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-xs text-muted-foreground line-through decoration-primary/20">
                  {formatCurrency(product.compare_at_price)}
                </span>
              )}
              <span className="text-xl font-bold text-foreground tracking-tight">
                {formatCurrency(product.price)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-12 h-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:scale-105 transition-all shadow-lg shadow-primary/20 disabled:opacity-30 active:scale-95 btn-premium"
              aria-label="Agregar al carrito"
            >
              <ShoppingCart size={20} />
            </button>
          </div>
        </div>
      </div>
    </Link>

  );
}
