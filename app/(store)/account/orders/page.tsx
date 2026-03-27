export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { ORDER_STATUSES } from "@/lib/constants";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import type { Order } from "@/types/database";

const statusColors: Record<string, "yellow" | "blue" | "indigo" | "purple" | "green" | "red" | "gray"> = {
  pending: "yellow",
  confirmed: "blue",
  processing: "indigo",
  shipped: "purple",
  delivered: "green",
  cancelled: "red",
  refunded: "gray",
};

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/account/orders");

  const { data: rawOrders } = await supabase
    .from("orders")
    .select("*")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });
  const orders = rawOrders as Order[] | null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Mis pedidos</h1>

      {orders && orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-mono font-medium text-gray-900">
                    {order.order_number}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDateTime(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge color={statusColors[order.status]}>
                    {ORDER_STATUSES.find((s) => s.value === order.status)?.label}
                  </Badge>
                  <span className="font-bold text-gray-900">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg font-medium mb-3">No tenés pedidos todavía</p>
          <Link href="/shop" className="text-blue-600 hover:underline">
            Explorar la tienda →
          </Link>
        </div>
      )}
    </div>
  );
}
