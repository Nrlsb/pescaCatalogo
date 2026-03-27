export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import StockAdjustButton from "@/components/admin/StockAdjustButton";
import type { ProductStock } from "@/types/database";

export default async function InventoryPage() {
  const supabase = await createClient();
  const { data: rawStock } = await supabase
    .from("product_stock")
    .select("*")
    .order("total_stock", { ascending: true });
  const stock = rawStock as ProductStock[] | null;

  const statusColor = {
    in_stock: "green",
    low_stock: "yellow",
    out_of_stock: "red",
  } as const;

  const statusLabel = {
    in_stock: "En stock",
    low_stock: "Stock bajo",
    out_of_stock: "Sin stock",
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        <Link
          href="/admin/inventory/adjust"
          className="inline-flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          Ajuste manual
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Producto</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">SKU</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Stock</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Umbral</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Estado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stock?.map((item) => (
              <tr key={item.product_id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-medium text-gray-900">{item.name}</td>
                <td className="px-5 py-4 text-gray-500 font-mono text-xs">{item.sku ?? "-"}</td>
                <td className="px-5 py-4">
                  <span className={`font-bold text-base ${
                    item.stock_status === "out_of_stock"
                      ? "text-red-600"
                      : item.stock_status === "low_stock"
                      ? "text-yellow-600"
                      : "text-green-700"
                  }`}>
                    {item.total_stock}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-500">{item.low_stock_threshold}</td>
                <td className="px-5 py-4">
                  <Badge color={statusColor[item.stock_status as keyof typeof statusColor]}>
                    {statusLabel[item.stock_status as keyof typeof statusLabel]}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <StockAdjustButton productId={item.product_id} productName={item.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
