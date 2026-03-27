export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/formatters";
import Badge from "@/components/ui/Badge";
import type { Profile } from "@/types/database";

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const { data: rawCustomers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });
  const customers = rawCustomers as Profile[] | null;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Clientes</h1>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Nombre</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Teléfono</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Rol</th>
              <th className="text-left px-5 py-3 font-semibold text-gray-600">Registro</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {customers?.map((customer) => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900">
                    {customer.full_name ?? "Sin nombre"}
                  </p>
                </td>
                <td className="px-5 py-4 text-gray-500">
                  {customer.phone ?? "-"}
                </td>
                <td className="px-5 py-4">
                  <Badge color="blue">{customer.role}</Badge>
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs">
                  {formatDate(customer.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!customers || customers.length === 0) && (
          <div className="text-center py-12 text-gray-500 text-sm">
            No hay clientes registrados
          </div>
        )}
      </div>
    </div>
  );
}
