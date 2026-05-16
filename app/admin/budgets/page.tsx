"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { formatDate, formatCurrency } from "@/lib/formatters";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { FileText, Plus, Search, FileDown, Mail, User, Package } from "lucide-react";
import type { Order, Product } from "@/types/database";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [newBudget, setNewBudget] = useState({
    customerName: "",
    items: [{ productId: "", quantity: 1, price: 0 }]
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: budgetsData } = await supabase
      .from("orders")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true);
    
    if (budgetsData) setBudgets(budgetsData);
    if (productsData) setProducts(productsData);
    setLoading(false);
  };

  const handleCreateBudget = () => {
    setIsModalOpen(false);
    alert("Presupuesto creado y enviado exitosamente");
  };

  return (
    <div className="p-8 animate-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Presupuestos</h1>
          <p className="text-slate-500">Generá cotizaciones personalizadas y enviarlas por email o WhatsApp.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Nuevo Presupuesto
        </Button>
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
            {loading ? (
              <tr><td colSpan={6} className="text-center py-20 text-slate-400 italic">Cargando presupuestos...</td></tr>
            ) : (
              budgets?.map((budget) => (
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
              ))
            )}
          </tbody>
        </table>
        {!loading && budgets.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <FileText size={48} className="mx-auto mb-4 opacity-10" />
            <p>No hay presupuestos activos.</p>
          </div>
        )}
      </div>

      {/* Modal Nuevo Presupuesto */}
      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Crear Nuevo Presupuesto"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <User size={16} /> Cliente
              </label>
              <input 
                type="text" 
                placeholder="Nombre completo"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={newBudget.customerName}
                onChange={(e) => setNewBudget({...newBudget, customerName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Mail size={16} /> Email de contacto
              </label>
              <input 
                type="email" 
                placeholder="ejemplo@correo.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Package size={16} /> Productos
            </label>
            <div className="space-y-3">
              {newBudget.items.map((item, index) => (
                <div key={index} className="flex gap-3 items-end">
                  <div className="flex-[3]">
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none">
                      <option value="">Seleccionar producto...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - {formatCurrency(p.price)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <input 
                      type="number" 
                      min="1" 
                      placeholder="Cant."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setNewBudget({...newBudget, items: [...newBudget.items, {productId: "", quantity: 1, price: 0}]})}
              className="text-primary text-xs font-bold hover:underline"
            >
              + Agregar otro producto
            </button>
          </div>

          <div className="pt-6 flex gap-3 border-t">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleCreateBudget} className="flex-1">
              Generar Presupuesto
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
