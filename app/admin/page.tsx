export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/formatters";
import { ShoppingBag, Package, Users, AlertTriangle } from "lucide-react";
import type { ProductStock } from "@/types/database";

async function getStats() {
  const supabase = await createClient();

  const [ordersRes, productsRes, customersRes, lowStockRes] = await Promise.all([
    supabase
      .from("orders")
      .select("total, created_at")
      .eq("payment_status", "paid"),
    supabase.from("products").select("id", { count: "exact" }).eq("is_active", true),
    supabase.from("profiles").select("id", { count: "exact" }).eq("role", "customer"),
    supabase.from("product_stock").select("*").eq("stock_status", "low_stock"),
  ]);

  type OrderSummary = { total: number; created_at: string };
  const orders = ordersRes.data as OrderSummary[] | null;
  const today = new Date().toISOString().split("T")[0];
  const todayOrders = orders?.filter((o) => o.created_at.startsWith(today));
  const todayRevenue = todayOrders?.reduce((sum, o) => sum + o.total, 0) ?? 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + o.total, 0) ?? 0;

  return {
    todayRevenue,
    totalRevenue,
    totalOrders: orders?.length ?? 0,
    totalProducts: productsRes.count ?? 0,
    totalCustomers: customersRes.count ?? 0,
    lowStockCount: lowStockRes.data?.length ?? 0,
    lowStockProducts: (lowStockRes.data as ProductStock[] | null) ?? [],
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  const kpis = [
    {
      label: "Ventas hoy",
      value: formatCurrency(stats.todayRevenue),
      icon: ShoppingBag,
      color: "blue",
    },
    {
      label: "Total ventas",
      value: formatCurrency(stats.totalRevenue),
      icon: ShoppingBag,
      color: "green",
    },
    {
      label: "Productos activos",
      value: stats.totalProducts.toString(),
      icon: Package,
      color: "indigo",
    },
    {
      label: "Clientes",
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: "purple",
    },
  ];

  const iconColors: Record<string, string> = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    indigo: "bg-indigo-100 text-indigo-600",
    purple: "bg-purple-100 text-purple-600",
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {kpis.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-gray-200 p-5"
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${iconColors[color]}`}>
                <Icon size={22} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-xl font-bold text-gray-900">{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {stats.lowStockCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={20} className="text-yellow-600" />
            <h2 className="font-semibold text-yellow-800">
              {stats.lowStockCount} productos con stock bajo
            </h2>
          </div>
          <div className="space-y-2">
            {stats.lowStockProducts.slice(0, 5).map((p) => (
              <div key={p.product_id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{p.name}</span>
                <span className="font-medium text-yellow-700">
                  {p.total_stock} en stock
                </span>
              </div>
            ))}
          </div>
          <a
            href="/admin/inventory"
            className="inline-block mt-3 text-sm text-yellow-700 hover:underline font-medium"
          >
            Ver inventario completo →
          </a>
        </div>
      )}
    </div>
  );
}
