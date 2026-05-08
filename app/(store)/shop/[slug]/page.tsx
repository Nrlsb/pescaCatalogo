export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import AddToCartButton from "@/components/shop/AddToCartButton";
import Badge from "@/components/ui/Badge";
import type { Metadata } from "next";
import type { Product, ProductVariant } from "@/types/database";

interface PageProps {
  params: Promise<{ slug: string }>;
}

type ProductDetail = Product & {
  categories: { name: string; slug: string } | null;
  product_variants: ProductVariant[];
  inventory: { quantity: number; variant_id: string | null }[];
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("name, description")
    .eq("slug", slug)
    .single();
  const product = data as { name: string; description: string | null } | null;
  return {
    title: product ? `${product.name} | PescaShop` : "Producto | PescaShop",
    description: product?.description ?? undefined,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data } = await supabase
    .from("products")
    .select(`*, categories (name, slug), product_variants (*), inventory (quantity, variant_id)`)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  const product = data as ProductDetail | null;
  if (!product) notFound();

  const totalStock =
    product.inventory?.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  const stockStatus =
    totalStock === 0
      ? "out_of_stock"
      : totalStock <= product.low_stock_threshold
      ? "low_stock"
      : "in_stock";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-premium group">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                priority
              />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                Sin imagen
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {product.images.map((img, i) => (
                <div 
                  key={i} 
                  className="relative h-24 w-24 flex-shrink-0 bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-primary transition-colors cursor-pointer shadow-sm"
                >
                  <Image src={img} alt={`${product.name} ${i + 1}`} fill className="object-cover p-2" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-8 lg:pl-4">
          <div className="space-y-4">
            {product.brand && (
              <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest rounded-full">
                {product.brand}
              </span>
            )}
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:from-blue-400 dark:to-cyan-300">
                {formatCurrency(product.price)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <>
                  <span className="text-2xl text-slate-400 line-through decoration-red-500/50">
                    {formatCurrency(product.compare_at_price)}
                  </span>
                  <Badge color="orange" size="md">
                    -{Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 py-4 border-y border-slate-100 dark:border-slate-800">
            {/* Stock Status */}
            <div>
              {stockStatus === "in_stock" && (
                <Badge color="green">En stock ({totalStock} disponibles)</Badge>
              )}
              {stockStatus === "low_stock" && (
                <Badge color="yellow">Últimas {totalStock} unidades</Badge>
              )}
              {stockStatus === "out_of_stock" && (
                <Badge color="red">Sin stock</Badge>
              )}
            </div>
            
            {product.sku && (
              <span className="text-sm font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                SKU: {product.sku}
              </span>
            )}
          </div>

          {product.description && (
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          <div className="pt-4">
            <AddToCartButton
              product={{
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0],
                sku: product.sku,
              }}
              variants={product.product_variants ?? []}
              outOfStock={stockStatus === "out_of_stock"}
            />
          </div>
        </div>
      </div>
    </div>

  );
}
