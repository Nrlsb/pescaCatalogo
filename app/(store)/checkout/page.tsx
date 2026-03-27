"use client";

import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/formatters";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";

interface ShippingForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
}

export default function CheckoutPage() {
  const { items, total, subtotal, clearCart } = useCartStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("transfer");
  const [form, setForm] = useState<ShippingForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postal_code: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          shipping: form,
          paymentMethod,
          subtotal: subtotal(),
          total: total(),
        }),
      });
      if (!res.ok) throw new Error("Error al crear el pedido");
      const { orderId } = await res.json();
      clearCart();
      router.push(`/checkout/success?order=${orderId}`);
    } catch {
      alert("Hubo un error al procesar tu pedido. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-bold text-gray-900 mb-5">Datos de envío</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Nombre completo"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="Juan García"
                  />
                </div>
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="juan@ejemplo.com"
                />
                <Input
                  label="Teléfono"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="11 1234-5678"
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Dirección"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    placeholder="Av. Corrientes 1234"
                  />
                </div>
                <Input
                  label="Ciudad"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  required
                  placeholder="Buenos Aires"
                />
                <Input
                  label="Provincia"
                  name="province"
                  value={form.province}
                  onChange={handleChange}
                  required
                  placeholder="Buenos Aires"
                />
                <Input
                  label="Código postal"
                  name="postal_code"
                  value={form.postal_code}
                  onChange={handleChange}
                  required
                  placeholder="1043"
                />
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="font-bold text-gray-900 mb-5">Método de pago</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { value: "transfer", label: "Transferencia bancaria" },
                  { value: "mercadopago", label: "MercadoPago" },
                  { value: "cash", label: "Efectivo al recibir" },
                ].map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPaymentMethod(m.value)}
                    className={`p-4 border rounded-xl text-sm font-medium text-left transition-colors ${
                      paymentMethod === m.value
                        ? "border-blue-700 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-20">
              <h2 className="font-bold text-gray-900 mb-4">Tu pedido</h2>
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-gray-600 truncate flex-1 mr-2">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-800 flex-shrink-0">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>A calcular</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-1">
                  <span>Total</span>
                  <span>{formatCurrency(total())}</span>
                </div>
              </div>
              <Button
                type="submit"
                size="lg"
                loading={loading}
                className="w-full mt-5"
                disabled={items.length === 0}
              >
                Confirmar pedido
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
