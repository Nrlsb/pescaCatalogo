"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePosStore } from "@/store/posStore";
import { formatCurrency } from "@/lib/formatters";
import { processProductsList } from "@/lib/offers";
import { createClient } from "@/lib/supabase/client";
import { Search, Trash2, ShoppingBag, Plus, Minus, Check, CreditCard, Banknote, Landmark, ScanBarcode, ArrowLeft } from "lucide-react";
import type { Product, Category } from "@/types/database";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Image from "next/image";
import { useNotification } from "@/components/ui/NotificationProvider";
import { useDolarStore } from "@/store/dolarStore";

interface ProductWithStock extends Product {
  inventory: { quantity: number }[];
}

export default function POSPage() {
  const { toast } = useNotification();
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<ProductWithStock[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [cashInput, setCashInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState<string | null>(null);
  const [isScannerMode, setIsScannerMode] = useState(true);
  const searchRef = useRef<HTMLInputElement>(null);

  // Obtener cotización de dólar BNA desde el store de Zustand
  const cotizacion = useDolarStore((s) => s.cotizacion);
  const fetchCotizacion = useDolarStore((s) => s.fetchCotizacion);

  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearSale,
    subtotal,
    paymentMethod,
    setPaymentMethod,
    cashReceived,
    setCashReceived,
    change,
  } = usePosStore();

  const total = subtotal();

  // Asegurar que la cotización está cargada
  useEffect(() => {
    fetchCotizacion();
  }, [fetchCotizacion]);

  useEffect(() => {
    const supabase = createClient();
    
    // Fetch products
    supabase
      .from("products")
      .select("*, inventory (quantity)")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        setProducts((data as ProductWithStock[]) ?? []);
      });

    // Fetch categories
    supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        setCategories((data as Category[]) ?? []);
      });
  }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    let result = products;

    // Aplicar la lógica unificada de ofertas y cotización de dólar BNA (USD a ARS)
    const currentCotizacion = cotizacion ?? 950;
    result = processProductsList(result, currentCotizacion) as ProductWithStock[];

    if (selectedCategory) {
      result = result.filter(p => p.category_id === selectedCategory);
    }

    if (q) {
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.sku?.toLowerCase().includes(q) ?? false) ||
          (p.brand?.toLowerCase().includes(q) ?? false)
      );

      // Scanner logic: if exactly one match by SKU, add it and clear search
      if (isScannerMode && result.length === 1 && result[0].sku?.toLowerCase() === q) {
        const p = result[0];
        const stock = p.inventory?.reduce((s, i) => s + i.quantity, 0) ?? 0;
        if (stock > 0) {
          addItem({
            productId: p.id,
            name: p.name,
            price: p.price,
            quantity: 1,
            image: p.images[0],
            sku: p.sku ?? undefined,
          });
          setSearch("");
          return;
        }
      }
    }
    
    setFiltered(result);
  }, [search, products, selectedCategory, isScannerMode, addItem, cotizacion]);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // Handle global keydown for scanner
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        searchRef.current?.focus();
      }
      if (e.key === "F4") {
        setPaymentOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          total,
          paymentMethod,
          cashReceived: paymentMethod === "cash" ? parseFloat(cashInput) : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const { orderNumber } = await res.json();
      setLastOrder(orderNumber);
      setPaymentOpen(false);
      setReceiptOpen(true);
      toast("Venta procesada con éxito", "success");
    } catch {
      toast("Error al procesar la venta", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleNewSale = () => {
    clearSale();
    setCashInput("");
    setReceiptOpen(false);
    setLastOrder(null);
    setTimeout(() => searchRef.current?.focus(), 100);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Left - Products & Filters */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Sub Header / Filters */}
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-4 shadow-sm z-10">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <Link 
              href="/" 
              className="p-2.5 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              title="Volver a la tienda"
            >
              <ArrowLeft size={22} strokeWidth={2.5} />
            </Link>
            <div className="relative flex-1 w-full">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Escanear código o buscar producto... (F2)"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-primary text-sm font-medium transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsScannerMode(!isScannerMode)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all border ${
                  isScannerMode 
                    ? "bg-primary/10 border-primary text-primary" 
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
                }`}
                title="Modo Escáner: Agrega automáticamente si encuentra un SKU exacto"
              >
                <ScanBarcode size={18} />
                <span className="hidden sm:inline">{isScannerMode ? "Escáner ON" : "Escáner OFF"}</span>
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === null
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map((product) => {
              const stock =
                product.inventory?.reduce(
                  (s: number, i: { quantity: number }) => s + i.quantity,
                  0
                ) ?? 0;
              const outOfStock = stock <= 0;
              return (
                <button
                  key={product.id}
                  onClick={() =>
                    !outOfStock &&
                    addItem({
                      productId: product.id,
                      name: product.name,
                      price: product.price,
                      quantity: 1,
                      image: product.images[0],
                      sku: product.sku ?? undefined,
                    })
                  }
                  disabled={outOfStock}
                  className={`group relative flex flex-col p-3 rounded-2xl border transition-all duration-300 ${
                    outOfStock
                      ? "border-slate-200 bg-slate-50 dark:bg-slate-900/50 opacity-40 grayscale cursor-not-allowed"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary hover:shadow-premium active:scale-95"
                  }`}
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-slate-50 dark:bg-slate-800/50">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] uppercase font-bold text-slate-400">
                        No img
                      </div>
                    )}
                    {stock < 5 && !outOfStock && (
                      <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded-md bg-amber-500 text-white text-[9px] font-black">
                        {stock} UN
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col flex-1 text-left">
                    <p className="text-[10px] text-primary font-black uppercase tracking-tighter mb-0.5 truncate">
                      {product.brand || "Generico"}
                    </p>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-xs line-clamp-2 leading-tight mb-2">
                      {product.name}
                    </p>
                    <div className="mt-auto flex items-baseline gap-1.5 flex-wrap">
                      <p className="text-sm font-black text-primary">
                        {formatCurrency(product.price)}
                      </p>
                      {product.compare_at_price && (
                        <p className="text-[10px] text-slate-400 line-through font-medium">
                          {formatCurrency(product.compare_at_price)}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p className="text-sm font-medium">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>

      {/* Right - Cart */}
      <div className="w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Venta Actual</h2>
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">
              {items.reduce((acc, i) => acc + i.quantity, 0)} items
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center">
                <ShoppingBag size={24} className="opacity-20" />
              </div>
              <p className="text-xs font-medium uppercase tracking-widest opacity-50">Esperando productos...</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all group"
              >
                <div className="relative h-12 w-12 rounded-xl bg-white dark:bg-slate-800 overflow-hidden border border-slate-100 dark:border-slate-700 flex-shrink-0">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[8px] font-bold text-slate-300">N/A</div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {item.name}
                  </p>
                  <p className="text-[10px] font-black text-primary">
                    {formatCurrency(item.price)}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                    className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white hover:border-primary transition-all"
                  >
                    <Minus size={12} strokeWidth={3} />
                  </button>
                  <span className="w-6 text-center text-xs font-black text-slate-900 dark:text-slate-100">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                    className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white hover:border-primary transition-all"
                  >
                    <Plus size={12} strokeWidth={3} />
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-500 font-bold uppercase tracking-widest">
              <span>Subtotal</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-2xl font-black text-slate-900 dark:text-white">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          
          <Button
            onClick={() => setPaymentOpen(true)}
            disabled={items.length === 0}
            size="lg"
            className="w-full text-sm font-black uppercase tracking-widest h-14 shadow-premium shadow-primary/30"
          >
            Cobrar (F4)
          </Button>
          
          {items.length > 0 && (
            <button
              onClick={clearSale}
              className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
            >
              Vaciar carrito
            </button>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Finalizar Venta"
      >
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl text-center border border-slate-100 dark:border-slate-800">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">Total a cobrar</p>
            <p className="text-4xl font-black text-primary">{formatCurrency(total)}</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Método de pago</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "cash", label: "Efectivo", icon: Banknote, color: "green" },
                { id: "card", label: "Tarjeta", icon: CreditCard, color: "blue" },
                { id: "transfer", label: "Transfer.", icon: Landmark, color: "purple" },
              ].map((m) => {
                const Icon = m.icon;
                const active = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-tighter border transition-all ${
                      active
                        ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/20"
                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <Icon size={20} />
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          {paymentMethod === "cash" && (
            <div className="space-y-3 animate-in">
              <div className="relative">
                <input
                  autoFocus
                  type="number"
                  value={cashInput}
                  onChange={(e) => {
                    setCashInput(e.target.value);
                    setCashReceived(parseFloat(e.target.value) || 0);
                  }}
                  placeholder="Monto entregado por el cliente"
                  className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-4 text-xl font-black text-center focus:outline-none focus:border-primary transition-all"
                />
              </div>
              {cashReceived >= total && cashReceived > 0 && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-1">Vuelto a entregar</p>
                  <p className="text-3xl font-black text-emerald-600">
                    {formatCurrency(change())}
                  </p>
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handleCheckout}
            loading={loading}
            size="lg"
            className="w-full h-14 font-black uppercase tracking-widest"
            disabled={paymentMethod === "cash" && (parseFloat(cashInput) || 0) < total}
          >
            Confirmar Venta
          </Button>
        </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        open={receiptOpen}
        onClose={handleNewSale}
        title="Venta Exitosa"
      >
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
            <Check size={40} strokeWidth={4} />
          </div>
          
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              ¡Operación Completa!
            </p>
            {lastOrder && (
              <p className="text-xs font-mono text-slate-400 mt-1 uppercase">
                Comprobante: {lastOrder}
              </p>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 text-left space-y-3 border border-slate-100 dark:border-slate-800">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-500">{item.name.toUpperCase()} × {item.quantity}</span>
                <span className="text-slate-900 dark:text-slate-100 font-black">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between items-baseline">
              <span className="text-xs font-black uppercase text-slate-400">Total Pagado</span>
              <span className="text-xl font-black text-primary">{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
              <span>Método</span>
              <span>{paymentMethod === "cash" ? "Efectivo" : paymentMethod === "card" ? "Tarjeta" : "Transferencia"}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             <Button variant="secondary" onClick={() => window.print()} className="font-black uppercase tracking-widest text-[10px]">
                Imprimir Ticket
             </Button>
             <Button onClick={handleNewSale} className="font-black uppercase tracking-widest text-[10px]">
                Nueva Venta
             </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
