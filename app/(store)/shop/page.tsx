export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/shop/ProductCard";
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
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-20">
            <h2 className="font-semibold text-gray-900 mb-4">Categorías</h2>
            <ul className="space-y-2">
              <li>
                <a
                  href="/shop"
                  className="text-sm text-gray-600 hover:text-blue-700 transition-colors"
                >
                  Todos los productos
                </a>
              </li>
              {categories?.map((cat: Category) => (
                <li key={cat.id}>
                  <a
                    href={`/shop/category/${cat.slug}`}
                    className="text-sm text-gray-600 hover:text-blue-700 transition-colors"
                  >
                    {cat.name}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-6 pt-5 border-t">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Ordenar por</h3>
              <div className="space-y-2">
                {[
                  { value: "", label: "Más recientes" },
                  { value: "price_asc", label: "Precio: menor a mayor" },
                  { value: "price_desc", label: "Precio: mayor a menor" },
                ].map((opt) => (
                  <a
                    key={opt.value}
                    href={`/shop?${new URLSearchParams({ ...params, sort: opt.value })}`}
                    className={`block text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      (params.sort ?? "") === opt.value
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-600 hover:bg-gray-100"
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
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {params.q ? `Resultados para "${params.q}"` : "Todos los productos"}
            </h1>
            <p className="text-sm text-gray-500">
              {products?.length ?? 0} productos
            </p>
          </div>

          {/* Search bar */}
          <form method="get" action="/shop" className="mb-6">
            <div className="relative">
              <input
                type="text"
                name="q"
                defaultValue={params.q}
                placeholder="Buscar productos..."
                className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                width="16"
                height="16"
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
