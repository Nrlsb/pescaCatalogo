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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative h-96 bg-gray-100 rounded-xl overflow-hidden">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-contain"
                priority
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Sin imagen
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.slice(1).map((img, i) => (
                <div key={i} className="relative h-20 w-20 bg-gray-100 rounded-lg overflow-hidden">
                  <Image src={img} alt={`${product.name} ${i + 2}`} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          {product.brand && (
            <p className="text-sm text-gray-500 uppercase tracking-wide font-medium">
              {product.brand}
            </p>
          )}
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            {product.compare_at_price && product.compare_at_price > product.price && (
              <>
                <span className="text-xl text-gray-400 line-through">
                  {formatCurrency(product.compare_at_price)}
                </span>
                <Badge color="orange">
                  -{Math.round((1 - product.price / product.compare_at_price) * 100)}% OFF
                </Badge>
              </>
            )}
          </div>

          {/* Stock */}
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
            <p className="text-sm text-gray-500">SKU: {product.sku}</p>
          )}

          {product.description && (
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          )}

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
  );
}
