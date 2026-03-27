export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/constants";
import Badge from "@/components/ui/Badge";
import OrderStatusUpdater from "@/components/admin/OrderStatusUpdater";
import type { Order, OrderItem } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
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

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: rawOrder } = await supabase
    .from("orders")
    .select("*, order_items (*), profiles (full_name, email)")
    .eq("id", id)
    .single();

  type OrderWithItems = Order & {
    order_items: OrderItem[];
    profiles: { full_name: string; email: string } | null;
  };
  const order = rawOrder as OrderWithItems | null;
  if (!order) notFound();

  const shipping = order.shipping_address as {
    line1?: string;
    city?: string;
    province?: string;
    postal_code?: string;
  } | null;

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pedido {order.order_number}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {formatDateTime(order.created_at)}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge color={statusColors[order.status]}>
            {ORDER_STATUSES.find((s) => s.value === order.status)?.label}
          </Badge>
          <Badge color={order.payment_status === "paid" ? "green" : "yellow"}>
            {PAYMENT_STATUSES.find((s) => s.value === order.payment_status)?.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customer */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Cliente</h2>
          <p className="text-sm text-gray-700">
            {(order.profiles as { full_name: string } | null)?.full_name ??
              order.shipping_name}
          </p>
          {order.shipping_email && (
            <p className="text-sm text-gray-500">{order.shipping_email}</p>
          )}
          {order.shipping_phone && (
            <p className="text-sm text-gray-500">{order.shipping_phone}</p>
          )}
        </div>

        {/* Shipping */}
        {shipping && (
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Envío</h2>
            <p className="text-sm text-gray-700">{shipping.line1}</p>
            <p className="text-sm text-gray-600">
              {shipping.city}, {shipping.province} {shipping.postal_code}
            </p>
            {order.shipping_method && (
              <p className="text-sm text-gray-500 mt-1">{order.shipping_method}</p>
            )}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b bg-gray-50">
          <h2 className="font-semibold text-gray-900">Productos</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 font-medium text-gray-600">Producto</th>
              <th className="text-center px-5 py-3 font-medium text-gray-600">Cantidad</th>
              <th className="text-right px-5 py-3 font-medium text-gray-600">Precio unit.</th>
              <th className="text-right px-5 py-3 font-medium text-gray-600">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(order.order_items as { id: string; product_name: string; variant_name: string | null; sku: string | null; quantity: number; unit_price: number; subtotal: number }[])?.map((item) => (
              <tr key={item.id}>
                <td className="px-5 py-3">
                  <p className="font-medium text-gray-900">{item.product_name}</p>
                  {item.variant_name && (
                    <p className="text-xs text-gray-500">{item.variant_name}</p>
                  )}
                  {item.sku && (
                    <p className="text-xs text-gray-400 font-mono">{item.sku}</p>
                  )}
                </td>
                <td className="px-5 py-3 text-center text-gray-700">
                  {item.quantity}
                </td>
                <td className="px-5 py-3 text-right text-gray-700">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="px-5 py-3 text-right font-medium text-gray-900">
                  {formatCurrency(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t bg-gray-50">
            <tr>
              <td colSpan={3} className="px-5 py-3 text-right font-semibold text-gray-700">Total</td>
              <td className="px-5 py-3 text-right font-bold text-gray-900 text-base">
                {formatCurrency(order.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Update status */}
      <OrderStatusUpdater orderId={order.id} currentStatus={order.status} currentPayment={order.payment_status} />
    </div>
  );
}
