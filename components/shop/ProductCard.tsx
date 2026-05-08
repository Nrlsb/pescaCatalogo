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
      <div className="flex flex-col h-full bg-card text-card-foreground rounded-2xl border border-border overflow-hidden hover:shadow-premium transition-all duration-300 hover:-translate-y-1">
        {/* Image */}
        <div className="relative aspect-[4/3] bg-slate-50 dark:bg-slate-900/50">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest font-bold">
              Sin imagen
            </div>
          )}
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {product.is_featured && (
              <Badge color="blue" size="sm">Destacado</Badge>
            )}
            {isLowStock && !isOutOfStock && (
              <Badge color="yellow" size="sm">¡Últimas!</Badge>
            )}
            {isOutOfStock && (
              <Badge color="red" size="sm">Sin stock</Badge>
            )}
          </div>
          {product.compare_at_price && product.compare_at_price > product.price && (
            <div className="absolute top-3 right-3">
              <Badge color="orange" size="sm">
                -{Math.round((1 - product.price / product.compare_at_price) * 100)}%
              </Badge>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-5 flex flex-col flex-1 gap-2">
          {product.brand && (
            <p className="text-[10px] text-primary font-black uppercase tracking-widest">
              {product.brand}
            </p>
          )}
          <h3 className="font-bold text-foreground text-sm line-clamp-2 leading-tight flex-1">
            {product.name}
          </h3>

          <div className="flex items-center justify-between mt-4">
            <div className="flex flex-col">
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-xs text-muted-foreground line-through decoration-rose-500/30">
                  {formatCurrency(product.compare_at_price)}
                </span>
              )}
              <span className="text-lg font-black text-foreground">
                {formatCurrency(product.price)}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-md shadow-primary/20 disabled:opacity-30 active:scale-95"
              aria-label="Agregar al carrito"
            >
              <ShoppingCart size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </Link>

  );
}
