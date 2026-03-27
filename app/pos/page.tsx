"use client";

import { useState, useEffect, useRef } from "react";
import { usePosStore } from "@/store/posStore";
import { formatCurrency } from "@/lib/formatters";
import { createClient } from "@/lib/supabase/client";
import { Search, Trash2, ShoppingBag } from "lucide-react";
import type { Product } from "@/types/database";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface ProductWithStock extends Product {
  inventory: { quantity: number }[];
}

export default function POSPage() {
  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [filtered, setFiltered] = useState<ProductWithStock[]>([]);
  const [search, setSearch] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [cashInput, setCashInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("products")
      .select("*, inventory (quantity)")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => {
        setProducts((data as ProductWithStock[]) ?? []);
        setFiltered((data as ProductWithStock[]) ?? []);
      });
  }, []);

  useEffect(() => {
    const q = search.toLowerCase().trim();
    if (!q) {
      setFiltered(products);
    } else {
      setFiltered(
        products.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            (p.sku?.toLowerCase().includes(q) ?? false)
        )
      );
    }
  }, [search, products]);

  useEffect(() => {
    searchRef.current?.focus();
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
    } catch {
      alert("Error al procesar la venta");
    } finally {
      setLoading(false);
    }
  };

  const handleNewSale = () => {
    clearSale();
    setCashInput("");
    setReceiptOpen(false);
    setLastOrder(null);
    searchRef.current?.focus();
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Left - Products */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-blue-900 text-white px-5 py-4 flex items-center gap-4">
          <ShoppingBag size={24} className="text-blue-300" />
          <h1 className="text-lg font-bold">Punto de Venta</h1>
          <div className="flex-1 ml-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nombre o código..."
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
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
                  className={`p-4 rounded-xl border text-left transition-all ${
                    outOfStock
                      ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                      : "border-gray-200 bg-white hover:border-blue-400 hover:shadow-md active:scale-95"
                  }`}
                >
                  <p className="font-medium text-gray-900 text-sm line-clamp-2 mb-2">
                    {product.name}
                  </p>
                  <p className="text-base font-bold text-blue-700">
                    {formatCurrency(product.price)}
                  </p>
                  <p className={`text-xs mt-1 ${outOfStock ? "text-red-500" : "text-gray-500"}`}>
                    {outOfStock ? "Sin stock" : `Stock: ${stock}`}
                  </p>
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              No se encontraron productos
            </div>
          )}
        </div>
      </div>

      {/* Right - Cart */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="px-5 py-4 border-b bg-gray-50">
          <h2 className="font-bold text-gray-900">Venta actual</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">
              Agregá productos al carrito
            </p>
          ) : (
            items.map((item) => (
              <div
                key={`${item.productId}-${item.variantId}`}
                className="flex items-center gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCurrency(item.price)} c/u
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.variantId, item.quantity - 1)
                    }
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm"
                  >
                    -
                  </button>
                  <span className="w-7 text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.variantId, item.quantity + 1)
                    }
                    className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-sm"
                  >
                    +
                  </button>
                </div>
                <div className="text-right min-w-[60px]">
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 space-y-3">
          <div className="flex justify-between text-lg font-bold text-gray-900">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <Button
            onClick={() => setPaymentOpen(true)}
            disabled={items.length === 0}
            size="lg"
            className="w-full text-base"
          >
            Cobrar
          </Button>
          {items.length > 0 && (
            <button
              onClick={clearSale}
              className="w-full text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Cancelar venta
            </button>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title="Cobrar venta"
      >
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Total a cobrar</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(total)}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Método de pago</p>
            <div className="grid grid-cols-3 gap-2">
              {(["cash", "card", "transfer"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    paymentMethod === m
                      ? "border-blue-700 bg-blue-50 text-blue-700"
                      : "border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {m === "cash" ? "Efectivo" : m === "card" ? "Tarjeta" : "Transferencia"}
                </button>
              ))}
            </div>
          </div>

          {paymentMethod === "cash" && (
            <div className="space-y-2">
              <input
                type="number"
                value={cashInput}
                onChange={(e) => {
                  setCashInput(e.target.value);
                  setCashReceived(parseFloat(e.target.value) || 0);
                }}
                placeholder="Monto recibido"
                className="w-full border border-gray-300 rounded-lg px-3 py-3 text-lg font-medium text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {cashReceived >= total && cashReceived > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-green-700">Cambio a entregar</p>
                  <p className="text-2xl font-bold text-green-800">
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
            className="w-full"
            disabled={paymentMethod === "cash" && (parseFloat(cashInput) || 0) < total}
          >
            Confirmar cobro
          </Button>
        </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal
        open={receiptOpen}
        onClose={handleNewSale}
        title="Venta completada"
      >
        <div className="text-center space-y-4">
          <div className="text-5xl">✅</div>
          <div>
            <p className="text-xl font-bold text-gray-900">
              ¡Venta registrada!
            </p>
            {lastOrder && (
              <p className="text-sm text-gray-500 mt-1">
                Pedido: <span className="font-mono">{lastOrder}</span>
              </p>
            )}
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId}`} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name} × {item.quantity}</span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
            {paymentMethod === "cash" && cashReceived > 0 && (
              <div className="flex justify-between text-green-700 text-sm">
                <span>Cambio</span>
                <span>{formatCurrency(change())}</span>
              </div>
            )}
          </div>
          <Button onClick={handleNewSale} size="lg" className="w-full">
            Nueva venta
          </Button>
        </div>
      </Modal>
    </div>
  );
}
