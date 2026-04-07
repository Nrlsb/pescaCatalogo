export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/formatters";
import type { Profile, Order } from "@/types/database";
import LogoutButton from "@/components/auth/LogoutButton";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?next=/account");

  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  const profile = rawProfile as Profile | null;

  const { data: rawOrders } = await supabase
    .from("orders")
    .select("id, order_number, total, status, created_at")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);
  const recentOrders = rawOrders as Pick<Order, "id" | "order_number" | "total" | "status" | "created_at">[] | null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Mi cuenta</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl mb-4">
            {(profile?.full_name ?? user.email ?? "U")[0].toUpperCase()}
          </div>
          <h2 className="font-semibold text-gray-900">
            {profile?.full_name ?? "Sin nombre"}
          </h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          {profile?.phone && (
            <p className="text-sm text-gray-500">{profile.phone}</p>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Miembro desde {formatDate(user.created_at)}
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {profile?.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center justify-center gap-2 w-full bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition-all shadow-sm hover:shadow-md"
              >
                Administrar tienda
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>

        {/* Recent orders */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900">Pedidos recientes</h2>
            <Link href="/account/orders" className="text-sm text-blue-600 hover:underline">
              Ver todos
            </Link>
          </div>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/account/orders/${order.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 text-sm font-mono">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${order.total.toFixed(2)}
                    </p>
                    <span className="text-xs text-gray-500 capitalize">{order.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">No tenés pedidos todavía.</p>
              <Link href="/shop" className="text-blue-600 hover:underline text-sm mt-2 block">
                Empezar a comprar →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
