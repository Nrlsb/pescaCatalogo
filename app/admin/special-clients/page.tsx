export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/formatters";
import Badge from "@/components/ui/Badge";
import { Star, Percent, UserPlus } from "lucide-react";
import type { Profile } from "@/types/database";

export default async function SpecialClientsPage() {
  const supabase = await createClient();
  
  // En una app real, filtraríamos por un campo is_special o similar
  const { data: rawCustomers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });
  
  const customers = rawCustomers as Profile[] | null;

  return (
    <div className="p-8 animate-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clientes VIP</h1>
          <p className="text-slate-500">Gestioná beneficios y descuentos exclusivos para tus mejores clientes.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20 active:scale-95">
          <UserPlus size={20} />
          Asignar VIP
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-4">
            <Star size={24} />
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total VIPs</p>
          <p className="text-3xl font-black text-slate-900">12</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
            <Percent size={24} />
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Descuento Promedio</p>
          <p className="text-3xl font-black text-slate-900">15%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4">
            <Star size={24} />
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Ventas VIP Mes</p>
          <p className="text-3xl font-black text-slate-900">$450.200</p>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase tracking-widest text-[10px]">Cliente</th>
              <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase tracking-widest text-[10px]">Estado</th>
              <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase tracking-widest text-[10px]">Descuento Fijo</th>
              <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase tracking-widest text-[10px]">Última Compra</th>
              <th className="text-right px-6 py-4 font-bold text-slate-600 uppercase tracking-widest text-[10px]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {customers?.map((customer, idx) => (
              <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500">
                      {customer.full_name?.[0] ?? "U"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{customer.full_name ?? "Sin nombre"}</p>
                      <p className="text-xs text-slate-500">{customer.phone ?? "Sin teléfono"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  {idx % 3 === 0 ? (
                    <Badge color="orange" className="flex items-center gap-1 w-fit">
                      <Star size={12} fill="currentColor" /> VIP Gold
                    </Badge>
                  ) : (
                    <Badge color="blue">Regular</Badge>
                  )}
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 font-mono font-bold text-primary">
                    {idx % 3 === 0 ? "15%" : "0%"}
                    <button className="p-1 hover:bg-primary/10 rounded transition-colors text-primary">
                      <Percent size={14} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-5 text-slate-500 text-xs">
                  {formatDate(customer.created_at)}
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-primary font-bold hover:underline text-xs">
                    Gestionar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!customers || customers.length === 0) && (
          <div className="text-center py-20 text-slate-400">
            <Star size={48} className="mx-auto mb-4 opacity-10" />
            <p>No se encontraron clientes para asignar beneficios.</p>
          </div>
        )}
      </div>
    </div>
  );
}
