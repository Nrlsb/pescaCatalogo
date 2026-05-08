export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/shop/ProductCard";
import Badge from "@/components/ui/Badge";
import type { Category, Product } from "@/types/database";

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

export const metadata = {
  title: "Tienda | PescaShop",
};

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

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
  const products = rawProducts as (Product & { stock_status?: string })[] | null;

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
          <div className="bg-card text-card-foreground border border-border rounded-2xl p-6 sticky top-24 shadow-sm">
            <h2 className="text-lg font-black tracking-tight mb-6 flex items-center gap-2">
              Categorías
            </h2>
            <ul className="space-y-1">
              <li>
                <a
                  href="/shop"
                  className={`block px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    !params.category 
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
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
                    className={`block px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      params.category === cat.slug
                        ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8 pt-6 border-t border-border">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">
                Ordenar por
              </h3>
              <div className="space-y-1">
                {[
                  { value: "", label: "Más recientes" },
                  { value: "price_asc", label: "Precio: menor a mayor" },
                  { value: "price_desc", label: "Precio: mayor a menor" },
                ].map((opt) => (
                  <a
                    key={opt.value}
                    href={`/shop?${new URLSearchParams({ ...params, sort: opt.value })}`}
                    className={`block px-3 py-2 rounded-xl text-sm font-medium transition-all ${
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
        <div className="flex-1 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              {params.q ? `Resultados para "${params.q}"` : "Explorar Tienda"}
            </h1>
            <Badge color="blue" size="md">
              {products?.length ?? 0} productos
            </Badge>
          </div>

          {/* Search bar */}
          <form method="get" action="/shop" className="group">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={params.q}
                placeholder="Buscar por nombre, marca o categoría..."
                className="w-full bg-card border-2 border-border rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </form>


          {products && products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product as Product & { stock_status?: string }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium mb-2">No se encontraron productos</p>
              <p className="text-sm">Intentá con otra búsqueda o categoría.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
