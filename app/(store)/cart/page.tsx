"use client";

import { useCartStore } from "@/store/cartStore";
import { formatCurrency } from "@/lib/formatters";
import Image from "next/image";
import Link from "next/link";
import Button from "@/components/ui/Button";
import { ShoppingCart, Trash2 } from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, total, couponDiscount } =
    useCartStore();

  const sub = subtotal();
  const tot = total();

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <ShoppingCart size={64} className="text-gray-300 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Tu carrito está vacío</h1>
        <p className="text-gray-500 mb-6">
          Explorá nuestra tienda y agregá productos.
        </p>
        <Link href="/shop">
          <Button size="lg">Ir a la tienda</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Tu carrito</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId}`}
              className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4"
            >
              <div className="relative h-20 w-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-xs">
                    Sin imagen
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    {item.variantName && (
                      <p className="text-sm text-gray-500">{item.variantName}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.variantId, item.quantity - 1)
                      }
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-l-lg"
                    >
                      -
                    </button>
                    <span className="px-3 py-1.5 text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.variantId, item.quantity + 1)
                      }
                      className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-r-lg"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-20">
            <h2 className="font-bold text-gray-900 mb-4">Resumen del pedido</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(sub)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento</span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>A calcular</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(tot)}</span>
              </div>
            </div>
            <Link href="/checkout">
              <Button size="lg" className="w-full mt-5">
                Continuar al checkout
              </Button>
            </Link>
            <Link
              href="/shop"
              className="block text-center text-sm text-gray-500 hover:text-gray-700 mt-3"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
