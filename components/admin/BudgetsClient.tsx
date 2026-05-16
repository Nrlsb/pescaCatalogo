"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/formatters";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { FileText, Plus, Search, FileDown, Mail, User, Package, Trash2, Hash, Calendar, DollarSign, Send, ArrowRight } from "lucide-react";
import type { Order, Product } from "@/types/database";

interface BudgetsClientProps {
  initialBudgets: Order[];
  products: Product[];
}

export default function BudgetsClient({ initialBudgets, products }: BudgetsClientProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [newBudget, setNewBudget] = useState({
    customerName: "",
    customerEmail: "",
    items: [{ productId: "", quantity: 1, customPrice: 0 }]
  });

  const handleCreateBudget = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBudget),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al crear el presupuesto");
      }

      setIsModalOpen(false);
      // Reiniciar form
      setNewBudget({
        customerName: "",
        customerEmail: "",
        items: [{ productId: "", quantity: 1, customPrice: 0 }]
      });
      
      router.refresh();
      alert("Presupuesto creado exitosamente");
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    setNewBudget({
      ...newBudget,
      items: [...newBudget.items, { productId: "", quantity: 1, customPrice: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = [...newBudget.items];
    newItems.splice(index, 1);
    setNewBudget({ ...newBudget, items: newItems });
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...newBudget.items];
    const item = { ...newItems[index], [field]: value };
    
    // Si cambia el producto, actualizamos el precio base automáticamente
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      item.customPrice = product?.price || 0;
    }
    
    newItems[index] = item;
    setNewBudget({ ...newBudget, items: newItems });
  };

  const calculateTotal = () => {
    return newBudget.items.reduce((acc, item) => {
      return acc + (item.customPrice || 0) * item.quantity;
    }, 0);
  };

  const filteredBudgets = initialBudgets.filter(budget => {
    const searchLower = searchTerm.toLowerCase();
    const orderNum = budget.order_number.toLowerCase();
    const name = (budget.shipping_name || "").toLowerCase();
    const email = (budget.shipping_email || "").toLowerCase();
    const ref = orderNum.replace("ord-", "pre-");
    
    return orderNum.includes(searchLower) || 
           name.includes(searchLower) || 
           email.includes(searchLower) ||
           ref.includes(searchLower);
  });

  return (
    <div className="p-8 min-h-screen bg-gray-50 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-2 text-ocean-gradient">Presupuestos</h1>
          <p className="text-slate-500 max-w-lg font-medium">
            Generá cotizaciones profesionales en segundos. Podés enviarlas directamente por email o descargarlas en PDF.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-premium group flex items-center gap-3 text-white border-none shadow-premium rounded-2xl px-8 py-5 transition-all hover:scale-[1.02] active:scale-[0.98] font-bold"
        >
          <Plus size={22} className="group-hover:rotate-90 transition-transform duration-500" />
          Nuevo Presupuesto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar por cliente, email o # presupuesto..." 
            className="w-full bg-white border border-slate-200 rounded-3xl pl-14 pr-6 py-5 text-sm text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-white border border-slate-200 rounded-3xl p-1 flex items-center shadow-sm">
          <button className="flex-1 py-3 text-xs font-bold text-blue-600 bg-blue-50 rounded-2xl">Todos</button>
          <button className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors">Borradores</button>
          <button className="flex-1 py-3 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-colors">Enviados</button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[40px] overflow-hidden shadow-premium">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 backdrop-blur-sm">
                <th className="text-left px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  <div className="flex items-center gap-2"><Hash size={12} /> Referencia</div>
                </th>
                <th className="text-left px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  <div className="flex items-center gap-2"><User size={12} /> Cliente</div>
                </th>
                <th className="text-left px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Estado</th>
                <th className="text-left px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  <div className="flex items-center gap-2"><DollarSign size={12} /> Total</div>
                </th>
                <th className="text-left px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">
                  <div className="flex items-center gap-2"><Calendar size={12} /> Vencimiento</div>
                </th>
                <th className="text-right px-8 py-5 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBudgets.map((budget) => (
                <tr key={budget.id} className="group hover:bg-blue-50/30 transition-all cursor-default">
                  <td className="px-8 py-6">
                    <span className="font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-xs">
                      #{budget.order_number.replace("ORD-", "PRE-")}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{budget.shipping_name ?? "Cliente Web"}</span>
                      <span className="text-xs text-slate-400">{budget.shipping_email ?? "Sin email"}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge color="yellow" className="px-3 py-1 rounded-full text-[10px] font-black uppercase">Borrador</Badge>
                  </td>
                  <td className="px-8 py-6 font-black text-slate-900 text-base">
                    {formatCurrency(budget.total)}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                      <span className="text-slate-600 font-medium">
                        {formatDate(new Date(new Date(budget.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString())}
                      </span>
                      <span className="text-[10px] text-rose-500 font-bold uppercase">Expira pronto</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        title="Descargar PDF" 
                        onClick={() => window.open(`/admin/budgets/${budget.id}/print`, '_blank')}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <FileDown size={18} />
                      </button>
                      <button 
                        title="Enviar por Email" 
                        onClick={() => alert("Enviando presupuesto a " + (budget.shipping_email || "cliente") + "...")}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <Mail size={18} />
                      </button>
                      <button 
                        onClick={() => router.push(`/admin/budgets/${budget.id}`)}
                        className="flex items-center gap-1 px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-blue-600 transition-all ml-2"
                      >
                        Ver <ArrowRight size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredBudgets.length === 0 && (
          <div className="text-center py-24 text-slate-400 bg-slate-50/50">
            <div className="bg-white w-20 h-20 rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
              <FileText size={32} className="text-slate-200" />
            </div>
            <h3 className="text-slate-900 font-bold mb-1">Sin presupuestos todavía</h3>
            <p className="text-sm">Hacé clic en "Nuevo Presupuesto" para empezar.</p>
          </div>
        )}
      </div>

      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Crear Nuevo Presupuesto"
        size="xl"
      >
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} className="text-blue-500" /> Datos del Cliente
              </label>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Nombre completo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                  value={newBudget.customerName}
                  onChange={(e) => setNewBudget({...newBudget, customerName: e.target.value})}
                />
                <input 
                  type="email" 
                  placeholder="email@ejemplo.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                  value={newBudget.customerEmail}
                  onChange={(e) => setNewBudget({...newBudget, customerEmail: e.target.value})}
                />
              </div>
            </div>
            
            <div className="bg-slate-50/50 rounded-[32px] p-8 flex flex-col justify-center items-center text-center border border-slate-100">
              <div className="w-14 h-14 bg-white rounded-2xl shadow-premium flex items-center justify-center mb-4 text-blue-600">
                <DollarSign size={28} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total del Presupuesto</p>
              <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{formatCurrency(calculateTotal())}</h2>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Package size={14} className="text-blue-600" /> Detalle de Productos
              </label>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 uppercase">
                {newBudget.items.length} {newBudget.items.length === 1 ? 'ítem' : 'ítems'} seleccionados
              </span>
            </div>
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {newBudget.items.map((item, index) => (
                <div key={index} className="group/item flex gap-3 items-start bg-white border border-slate-100 p-2.5 rounded-[24px] shadow-sm hover:border-blue-200 hover:shadow-premium transition-all duration-300">
                  <div className="flex-[3]">
                    <select 
                      className="w-full bg-transparent border-none rounded-xl px-4 py-3 text-sm focus:outline-none cursor-pointer font-bold text-slate-700"
                      value={item.productId}
                      onChange={(e) => updateItem(index, 'productId', e.target.value)}
                    >
                      <option value="">Buscar un producto...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-[1.5] min-w-[140px]">
                    <div className="relative">
                      <input 
                        type="number" 
                        value={item.customPrice}
                        onChange={(e) => updateItem(index, 'customPrice', parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-8 pr-4 py-4 text-sm focus:outline-none text-left font-black text-slate-900 group-hover/item:bg-white transition-colors"
                      />
                      <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <span className="absolute -top-2 left-4 text-[8px] font-black text-blue-500 bg-white px-2 py-0.5 rounded-full shadow-sm border border-blue-50 transition-all uppercase tracking-tighter">Precio Unit.</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <div className="relative">
                      <input 
                        type="number" 
                        min="1" 
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-4 text-sm focus:outline-none text-center font-black text-slate-900 group-hover/item:bg-white transition-colors"
                      />
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-black text-blue-500 bg-white px-2 py-0.5 rounded-full shadow-sm border border-blue-50 transition-all uppercase tracking-tighter">Cant.</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeItem(index)}
                    disabled={newBudget.items.length === 1}
                    className="p-4 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-[20px] transition-all disabled:opacity-0"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              onClick={addItem}
              className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[24px] text-slate-400 text-xs font-black hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              <Plus size={18} /> Agregar Ítem
            </button>
          </div>

          <div className="pt-6 grid grid-cols-2 gap-5">
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="py-5 rounded-[24px] font-black text-slate-400 bg-slate-50 hover:bg-slate-100 border-none transition-all uppercase tracking-widest text-xs"
            >
              Descartar
            </button>
            <button 
              onClick={handleCreateBudget} 
              className="btn-premium py-5 rounded-[24px] font-black text-white shadow-premium border-none flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-50"
              disabled={!newBudget.customerName || !newBudget.items[0].productId || loading}
            >
              {loading ? "Generando..." : "Generar Presupuesto"} <Send size={20} />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
