export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime } from "@/lib/formatters";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { ArrowLeft, Package, User, Info } from "lucide-react";

const reasonLabels: Record<string, string> = {
  sale_online: "Venta online",
  sale_pos: "Venta presencial",
  purchase: "Compra/Ingreso",
  adjustment: "Ajuste manual",
  return: "Devolución",
  damage: "Daño/Pérdida",
};

const reasonColors: Record<string, "blue" | "indigo" | "green" | "yellow" | "purple" | "red"> = {
  sale_online: "blue",
  sale_pos: "indigo",
  purchase: "green",
  adjustment: "yellow",
  return: "purple",
  damage: "red",
};

export default async function InventoryMovementsPage() {
  const supabase = await createClient();

  const { data: movements, error } = await supabase
    .from("inventory_movements")
    .select(`
      *,
      products (name),
      product_variants (name),
      profiles (full_name)
    `)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="p-8">
      <div className="flex items-center gap-4 mb-6">
        <Link 
          href="/admin/inventory" 
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Historial de movimientos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Registro de todas las entradas y salidas de stock.
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">Fecha</th>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">Producto</th>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">Motivo</th>
                <th className="text-center px-5 py-4 font-semibold text-gray-600">Cantidad</th>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">Usuario</th>
                <th className="text-left px-5 py-4 font-semibold text-gray-600">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movements?.map((m: any) => (
                <tr key={m.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                    {formatDateTime(m.created_at)}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{m.products?.name}</span>
                      {m.product_variants?.name && (
                        <span className="text-xs text-gray-500 font-medium">
                          Variante: {m.product_variants.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <Badge color={reasonColors[m.reason] || "gray"}>
                      {reasonLabels[m.reason] || m.reason}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-black text-sm ${
                      m.delta > 0 
                        ? "bg-emerald-50 text-emerald-700" 
                        : "bg-rose-50 text-rose-700"
                    }`}>
                      {m.delta > 0 ? `+${m.delta}` : m.delta}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User size={14} className="text-gray-400" />
                      <span className="font-medium">{m.profiles?.full_name || "Sistema"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {m.notes ? (
                      <div className="flex items-start gap-2 max-w-xs group">
                        <Info size={14} className="text-gray-300 mt-0.5 group-hover:text-blue-400 transition-colors" />
                        <span className="text-xs text-gray-500 italic leading-snug">
                          {m.notes}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {(!movements || movements.length === 0) && (
          <div className="text-center py-20 bg-gray-50/30">
            <Package size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-medium">No hay movimientos registrados todavía.</p>
          </div>
        )}
      </div>
    </div>
  );
}
