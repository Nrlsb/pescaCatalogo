export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/formatters";
import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import { Plus, Pencil, Image as ImageIcon } from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";
import type { Product } from "@/types/database";

type ProductWithCategory = Product & { categories: { name: string } | null };

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: rawProducts } = await supabase
    .from("products")
    .select("*, categories (name)")
    .order("created_at", { ascending: false });
  const products = rawProducts as ProductWithCategory[] | null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          <Plus size={18} />
          Nuevo producto
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Producto</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Categoría</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Precio</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">SKU</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Estado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products?.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                      {product.images && product.images.length > 0 ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400">
                          <ImageIcon size={16} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      {product.brand && (
                        <p className="text-xs text-gray-500">{product.brand}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {(product.categories as { name: string } | null)?.name ?? "-"}
                </td>
                <td className="px-5 py-4 font-medium text-gray-900">
                  {formatCurrency(product.price)}
                </td>
                <td className="px-5 py-4 text-gray-500 font-mono text-xs">
                  {product.sku ?? "-"}
                </td>
                <td className="px-5 py-4">
                  <Badge color={product.is_active ? "green" : "gray"}>
                    {product.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <Link
                      href={`/admin/products/${product.id}`}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <Pencil size={16} />
                    </Link>
                    <DeleteProductButton productId={product.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!products || products.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            No hay productos. <Link href="/admin/products/new" className="text-blue-600 hover:underline">Crear el primero</Link>
          </div>
        )}
      </div>
    </div>
  );
}
