export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import type { Order } from "@/types/database";

type OrderWithProfile = Order & { profiles: { full_name: string } | null };

interface PageProps {
  searchParams: Promise<{ status?: string; channel?: string }>;
}

const statusColors: Record<string, "yellow" | "blue" | "indigo" | "purple" | "green" | "red" | "gray"> = {
  pending: "yellow",
  confirmed: "blue",
  processing: "indigo",
  shipped: "purple",
  delivered: "green",
  cancelled: "red",
  refunded: "gray",
};

const paymentColors: Record<string, "yellow" | "green" | "red" | "gray"> = {
  pending: "yellow",
  paid: "green",
  failed: "red",
  refunded: "gray",
};

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("*, profiles (full_name)")
    .order("created_at", { ascending: false });

  if (params.status) query = query.eq("status", params.status);
  if (params.channel) query = query.eq("channel", params.channel);

  const { data: rawOrders } = await query;
  const orders = rawOrders as OrderWithProfile[] | null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pedidos</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <Link
          href="/admin/orders"
          className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
            !params.status && !params.channel
              ? "bg-blue-700 text-white"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          Todos
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s.value}
            href={`/admin/orders?status=${s.value}`}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
              params.status === s.value
                ? "bg-blue-700 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">N° Pedido</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Cliente</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Canal</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Total</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Estado</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Pago</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Fecha</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders?.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-mono text-xs text-gray-700">
                  {order.order_number}
                </td>
                <td className="px-5 py-4 text-gray-700">
                  {(order.profiles as { full_name: string } | null)?.full_name ??
                    order.shipping_name ??
                    "Cliente invitado"}
                </td>
                <td className="px-5 py-4">
                  <Badge color={order.channel === "pos" ? "indigo" : "blue"}>
                    {order.channel === "pos" ? "POS" : "Online"}
                  </Badge>
                </td>
                <td className="px-5 py-4 font-semibold text-gray-900">
                  {formatCurrency(order.total)}
                </td>
                <td className="px-5 py-4">
                  <Badge color={statusColors[order.status]}>
                    {ORDER_STATUSES.find((s) => s.value === order.status)?.label}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <Badge color={paymentColors[order.payment_status]}>
                    {PAYMENT_STATUSES.find((s) => s.value === order.payment_status)?.label}
                  </Badge>
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs">
                  {formatDateTime(order.created_at)}
                </td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="text-blue-600 hover:underline text-xs font-medium"
                  >
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!orders || orders.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            No hay pedidos con los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
}
