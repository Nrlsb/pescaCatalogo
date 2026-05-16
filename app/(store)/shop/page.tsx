export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/shop/ProductCard";
import Badge from "@/components/ui/Badge";
import { Fish, ShoppingBag } from "lucide-react";
import type { Category, Product } from "@/types/database";
import { getDolarCotizacion } from "@/lib/dolar";

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

export const metadata = {
  title: "Tienda | PescaShop",
};

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;
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

  // Build query
  let query = supabase
    .from("products")
    .select(
      `
      *,
      categories (name, slug),
      inventory (quantity)
    `
    )
    .eq("is_active", true);

  if (params.q) {
    query = query.ilike("name", `%${params.q}%`);
  }

  if (params.sort === "price_asc") query = query.order("price", { ascending: true });
  else if (params.sort === "price_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data: rawProducts } = await query;
  
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

  // Get categories for filter
  const { data: rawCategories } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");
  const categories = rawCategories as Category[] | null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-card text-card-foreground border border-gray-100 rounded-2xl p-8 sticky top-24 shadow-premium">
            <h2 className="text-xl font-serif tracking-tight mb-6 flex items-center gap-2">
              Categorías
            </h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="/shop"
                  className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    !params.category 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  Todos los productos
                </a>
              </li>
              {categories?.map((cat: Category) => (
                <li key={cat.id}>
                  <a
                    href={`/shop/category/${cat.slug}`}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      params.category === cat.slug
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-10 pt-8 border-t border-gray-100">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6">
                Ordenar por
              </h3>
              <div className="space-y-2">
                {[
                  { value: "", label: "Más recientes" },
                  ...(isAdmin ? [
                    { value: "price_asc", label: "Menor precio" },
                    { value: "price_desc", label: "Mayor precio" },
                  ] : []),
                ].map((opt) => (
                  <a
                    key={opt.value}
                    href={`/shop?${new URLSearchParams({ ...params, sort: opt.value })}`}
                    className={`block px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      (params.sort ?? "") === opt.value
                        ? "bg-secondary text-primary font-bold"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {opt.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-gray-100 pb-6">
            <div>
              <h1 className="text-4xl font-serif text-foreground mb-2">
                {params.q ? `Resultados para "${params.q}"` : "Nuestra Colección"}
              </h1>
              <p className="text-muted-foreground text-sm">Explora nuestra selección curada de artículos de pesca premium.</p>
            </div>
            <div className="bg-primary/5 text-primary px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/10">
              {products?.length ?? 0} artículos
            </div>
          </div>

          {/* Search bar */}
          <form method="get" action="/shop" className="group">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={params.q}
                placeholder="Buscar por nombre, marca o categoría..."
                className="w-full bg-white border border-gray-100 rounded-2xl pl-14 pr-6 py-5 text-sm font-medium focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all shadow-premium"
              />
              <svg
                className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </form>


          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product as Product & { stock_status?: string }}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200">
              <Fish className="mx-auto text-primary/20 mb-6" size={64} strokeWidth={1.5} />
              <p className="text-xl font-serif text-gray-500 mb-2">No encontramos artículos</p>
              <p className="text-sm text-gray-400">Intentá con otra búsqueda o seleccioná una categoría diferente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
