"use client";

import { useState } from "react";
import { formatDate } from "@/lib/formatters";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Star, Percent, UserPlus, Search } from "lucide-react";
import type { Profile } from "@/types/database";
import { useNotification } from "@/components/ui/NotificationProvider";

interface SpecialClientsClientProps {
  initialCustomers: Profile[];
}

export default function SpecialClientsClient({ initialCustomers }: SpecialClientsClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [discount, setDiscount] = useState<number>(10);
  const { toast } = useNotification();

  const handleAssignVIP = () => {
    setIsModalOpen(false);
    toast("Cliente asignado como VIP exitosamente (Simulado)", "success");
  };

  return (
    <div className="p-8 animate-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Clientes VIP</h1>
          <p className="text-slate-500">Gestioná beneficios y descuentos exclusivos para tus mejores clientes.</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <UserPlus size={20} />
          Asignar VIP
        </Button>
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
            {initialCustomers.map((customer, idx) => (
              <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 uppercase">
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
        {initialCustomers.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Star size={48} className="mx-auto mb-4 opacity-10" />
            <p>No se encontraron clientes para asignar beneficios.</p>
          </div>
        )}
      </div>

      {/* Modal Asignar VIP */}
      <Modal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Asignar Estatus VIP"
        size="md"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Seleccionar Cliente</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">Buscar cliente...</option>
                {initialCustomers.map(c => (
                  <option key={c.id} value={c.id}>{c.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Descuento Especial (%)</label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="0" 
                max="50" 
                step="5"
                value={discount}
                onChange={(e) => setDiscount(parseInt(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="w-12 text-center font-black text-primary text-xl">{discount}%</span>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleAssignVIP} className="flex-1" disabled={!selectedCustomer}>
              Confirmar VIP
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
