"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import { useNotification } from "@/components/ui/NotificationProvider";
import { 
  Percent, 
  Search, 
  Calendar, 
  Trash2, 
  Pencil, 
  Image as ImageIcon,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface ProductOffer {
  id: string;
  name: string;
  sku: string | null;
  brand: string | null;
  images: string[];
  price: number;
  compare_at_price: number | null;
  currency: string;
  offer_price: number | null;
  offer_start: string | null;
  offer_end: string | null;
}

interface OffersClientProps {
  initialOffers: ProductOffer[];
  cotizacion: number;
}

export default function OffersClient({ initialOffers, cotizacion }: OffersClientProps) {
  const { toast } = useNotification();
  const [offers, setOffers] = useState<ProductOffer[]>(initialOffers);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "active" | "scheduled" | "expired">("all");
  const [isPending, startTransition] = useTransition();
  const [disablingId, setDisablingId] = useState<string | null>(null);

  // Helper para verificar el estado de una oferta programada
  const getOfferStatus = (offer: ProductOffer) => {
    if (!offer.offer_price || offer.offer_price <= 0) return "none";
    const now = new Date();
    
    if (offer.offer_start) {
      const start = new Date(offer.offer_start);
      if (now < start) return "scheduled";
    }
    
    if (offer.offer_end) {
      const end = new Date(offer.offer_end);
      if (now > end) return "expired";
    }
    
    return "active";
  };

  // Formatear fecha legible
  const formatDate = (isoString: string | null) => {
    if (!isoString) return "-";
    try {
      const d = new Date(isoString);
      return d.toLocaleString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  // Calcular estadísticas para los KPIs
  const stats = {
    total: offers.length,
    active: offers.filter(o => getOfferStatus(o) === "active").length,
    scheduled: offers.filter(o => getOfferStatus(o) === "scheduled").length,
    expired: offers.filter(o => getOfferStatus(o) === "expired").length,
  };

  // Acción para desactivar oferta instantáneamente
  const handleDisableOffer = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`¿Estás seguro que deseas desactivar la oferta de "${name}"?`);
    if (!confirmDelete) return;

    setDisablingId(id);
    try {
      // Obtenemos el producto original
      const productToUpdate = offers.find(o => o.id === id);
      if (!productToUpdate) return;

      const body = {
        ...productToUpdate,
        // Borramos los campos de oferta
        offer_price: null,
        offer_start: null,
        offer_end: null
      };

      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error();
      
      toast("Oferta desactivada correctamente", "success");
      // Actualizamos el estado local
      setOffers(prev => prev.filter(o => o.id !== id));
    } catch {
      toast("Error al desactivar la oferta", "error");
    } finally {
      setDisablingId(null);
    }
  };

  // Filtrar ofertas según búsqueda y pestaña activa
  const filteredOffers = offers.filter(offer => {
    const status = getOfferStatus(offer);
    const matchesTab = 
      activeTab === "all" ||
      (activeTab === "active" && status === "active") ||
      (activeTab === "scheduled" && status === "scheduled") ||
      (activeTab === "expired" && status === "expired");

    const matchesSearch = 
      offer.name.toLowerCase().includes(search.toLowerCase()) ||
      (offer.sku?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (offer.brand?.toLowerCase() || "").includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* KPIs Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl">
            <Percent size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Programadas</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        {/* Activas */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Play size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Ofertas Activas</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
          </div>
        </div>

        {/* Programadas */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Próximas/Programadas</p>
            <p className="text-2xl font-bold text-amber-600">{stats.scheduled}</p>
          </div>
        </div>

        {/* Vencidas */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-md transition-all duration-300">
          <div className="p-3.5 bg-gray-50 text-gray-500 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Ofertas Vencidas</p>
            <p className="text-2xl font-bold text-gray-700">{stats.expired}</p>
          </div>
        </div>
      </div>

      {/* Search & Tabs control container */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
            {(["all", "active", "scheduled", "expired"] as const).map((tab) => {
              const labels = {
                all: "Todas",
                active: "Activas",
                scheduled: "Programadas",
                expired: "Vencidas"
              };
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 md:flex-none px-4 py-2 text-xs font-semibold rounded-lg transition-all capitalize whitespace-nowrap ${
                    active 
                      ? "bg-white text-blue-700 shadow-sm" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, SKU, marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>

        {/* Offers List */}
        <div className="overflow-x-auto rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="text-left px-5 py-4">Producto</th>
                <th className="text-left px-5 py-4">Precio Regular</th>
                <th className="text-left px-5 py-4">Precio Oferta</th>
                <th className="text-left px-5 py-4">Descuento</th>
                <th className="text-left px-5 py-4">Vigencia</th>
                <th className="text-left px-5 py-4">Estado</th>
                <th className="px-5 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredOffers.map((offer) => {
                const status = getOfferStatus(offer);
                const isUSD = offer.currency === "USD" || !offer.currency;
                const rate = isUSD ? cotizacion : 1;
                
                const normalPriceARS = Math.round(offer.price * rate);
                const offerPriceARS = offer.offer_price ? Math.round(offer.offer_price * rate) : 0;
                const discountPercent = offer.offer_price && offer.price 
                  ? Math.round((1 - offer.offer_price / offer.price) * 100)
                  : 0;

                return (
                  <tr key={offer.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Producto */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-12 w-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-100">
                          {offer.images && offer.images.length > 0 ? (
                            <Image
                              src={offer.images[0]}
                              alt={offer.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-400">
                              <ImageIcon size={18} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm line-clamp-1">{offer.name}</p>
                          <div className="flex gap-2 items-center text-xs text-gray-500 mt-0.5">
                            {offer.brand && <span className="font-medium">{offer.brand}</span>}
                            {offer.brand && offer.sku && <span>•</span>}
                            {offer.sku && <span className="font-mono">{offer.sku}</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Precio Regular */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {isUSD ? `U$S ${offer.price.toFixed(2)}` : formatCurrency(offer.price)}
                      </div>
                      {isUSD && (
                        <div className="text-[10px] text-gray-400">
                          ~ {formatCurrency(normalPriceARS)}
                        </div>
                      )}
                    </td>

                    {/* Precio Oferta */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="font-bold text-blue-700">
                        {isUSD ? `U$S ${offer.offer_price?.toFixed(2)}` : formatCurrency(offer.offer_price ?? 0)}
                      </div>
                      {isUSD && offer.offer_price && (
                        <div className="text-[10px] text-gray-400">
                          ~ {formatCurrency(offerPriceARS)}
                        </div>
                      )}
                    </td>

                    {/* Porcentaje Descuento */}
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold border border-rose-100">
                        -{discountPercent}% OFF
                      </span>
                    </td>

                    {/* Vigencia */}
                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1 text-xs text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[9px] uppercase tracking-wider text-gray-400 w-9">Inicio:</span>
                          <span className="font-medium">{formatDate(offer.offer_start)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-[9px] uppercase tracking-wider text-gray-400 w-9">Fin:</span>
                          <span className="font-medium">{formatDate(offer.offer_end)}</span>
                        </div>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-4">
                      {status === "active" && (
                        <Badge color="green" size="sm">Activa</Badge>
                      )}
                      {status === "scheduled" && (
                        <Badge color="yellow" size="sm">Programada</Badge>
                      )}
                      {status === "expired" && (
                        <Badge color="gray" size="sm">Vencida</Badge>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/admin/products/${offer.id}`}
                          title="Editar producto/oferta"
                          className="p-2 rounded-lg text-gray-500 hover:text-blue-700 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          onClick={() => handleDisableOffer(offer.id, offer.name)}
                          disabled={disablingId === offer.id}
                          title="Desactivar oferta"
                          className="p-2 rounded-lg text-gray-500 hover:text-rose-700 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100 disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredOffers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-gray-500">
                    <Percent className="mx-auto text-gray-300 mb-3" size={48} strokeWidth={1.5} />
                    <p className="font-semibold text-gray-900">No se encontraron ofertas</p>
                    <p className="text-xs text-gray-400 mt-1">Intenta ajustando el buscador o los filtros de estado.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
