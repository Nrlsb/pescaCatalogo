export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatCurrency } from "@/lib/formatters";
import Badge from "@/components/ui/Badge";
import { FileText, Plus, Search, FileDown, Mail } from "lucide-react";
import type { Order } from "@/types/database";

export default async function BudgetsPage() {
  const supabase = await createClient();
  
  // Usamos la tabla de pedidos pero filtrando o simulando que son presupuestos (status draft/pending)
  const { data: rawBudgets } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  
  const budgets = rawBudgets as Order[] | null;

  return (
    <div className="p-8 animate-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Presupuestos</h1>
          <p className="text-slate-500">Generá cotizaciones personalizadas y enviarlas por email o WhatsApp.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-primary/20 active:scale-95">
          <Plus size={20} />
          Nuevo Presupuesto
        </button>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar por cliente o número de presupuesto..." 
          className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4 text-sm focus:outline-none focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all shadow-sm"
        />
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase tracking-widest text-[10px]">Nro Presupuesto</th>
              <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase tracking-widest text-[10px]">Cliente</th>
              <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase tracking-widest text-[10px]">Estado</th>
              <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase tracking-widest text-[10px]">Total</th>
              <th className="text-left px-6 py-4 font-bold text-slate-600 uppercase tracking-widest text-[10px]">Vencimiento</th>
              <th className="text-right px-6 py-4 font-bold text-slate-600 uppercase tracking-widest text-[10px]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {budgets?.map((budget) => (
              <tr key={budget.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5 font-mono font-bold text-primary">
                  #{budget.order_number.replace("ORD-", "PRE-")}
                </td>
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-900">{budget.shipping_name ?? "Cliente Web"}</p>
                  <p className="text-xs text-slate-500">{budget.shipping_email ?? "Sin email"}</p>
                </td>
                <td className="px-6 py-5">
                  <Badge color="yellow">Borrador</Badge>
                </td>
                <td className="px-6 py-5 font-bold text-slate-900">
                  {formatCurrency(budget.total)}
                </td>
                <td className="px-6 py-5 text-slate-500 text-xs">
                  {formatDate(new Date(new Date(budget.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())}
                </td>
                <td className="px-6 py-5 text-right">
                  <div className="flex justify-end gap-2">
                    <button title="Descargar PDF" className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <FileDown size={18} />
                    </button>
                    <button title="Enviar por Email" className="p-2 text-slate-400 hover:text-primary transition-colors">
                      <Mail size={18} />
                    </button>
                    <button className="text-primary font-bold hover:underline text-xs ml-2">
                      Editar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!budgets || budgets.length === 0) && (
          <div className="text-center py-20 text-slate-400">
            <FileText size={48} className="mx-auto mb-4 opacity-10" />
            <p>No hay presupuestos activos.</p>
          </div>
        )}
      </div>
    </div>
  );
}
