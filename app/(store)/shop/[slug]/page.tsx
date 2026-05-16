export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import AddToCartButton from "@/components/shop/AddToCartButton";
import ProductGallery from "@/components/shop/ProductGallery";
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

  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    isAdmin = (profile as { role: string } | null)?.role === "admin";
  }

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
        <ProductGallery images={product.images} name={product.name} />

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

            {isAdmin && (
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
            )}
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
            {isAdmin ? (
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
            ) : (
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`https://wa.me/5491112345678?text=${encodeURIComponent(`Hola! Quisiera consultar por el producto: ${product.name}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-xl hover:shadow-[#25D366]/20"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  WhatsApp
                </a>
                <a
                  href="https://instagram.com/pescashop_ok"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-all shadow-xl hover:shadow-[#ee2a7b]/20"
                >
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.332 3.608 1.308.975.975 1.245 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.332 2.633-1.308 3.608-.975.975-2.242 1.245-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.332-3.608-1.308-.975-.975-1.245-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.332-2.633 1.308-3.608.975-.975 2.242-1.245 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.281.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.358-2.618-6.78-6.98-6.98-1.28-.058-1.689-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  Instagram
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

  );
}
