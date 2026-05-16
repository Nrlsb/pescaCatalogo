export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import ProductCard from "@/components/shop/ProductCard";
import type { Category, Product } from "@/types/database";

import { getDolarCotizacion } from "@/lib/dolar";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: rawCategory } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  const category = rawCategory as Category | null;
  if (!category) notFound();

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

  const { data: rawProducts } = await supabase
    .from("products")
    .select("*, inventory (quantity)")
    .eq("category_id", category.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });
    
  // Obtener cotización de dólar BNA para conversión automática
  const cotizacion = await getDolarCotizacion();
  
  const products = rawProducts 
    ? (rawProducts as Product[]).map(p => {
        const isUSD = (p as any).currency === "USD" || !(p as any).currency;
        const rate = isUSD ? cotizacion : 1;
        return {
          ...p,
          price: Math.round(p.price * rate),
          compare_at_price: p.compare_at_price ? Math.round(p.compare_at_price * rate) : null
        };
      })
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 mt-2">{category.description}</p>
        )}
      </div>

      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product as Product & { stock_status?: string }}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No hay productos en esta categoría todavía.</p>
        </div>
      )}
    </div>
  );
}
