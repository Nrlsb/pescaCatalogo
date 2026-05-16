export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/formatters";
import type { Order, OrderItem } from "@/types/database";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BudgetPrintPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: rawOrder } = await supabase
    .from("orders")
    .select("*, order_items (*), profiles!orders_customer_id_fkey (full_name)")
    .eq("id", id)
    .single();

  type OrderWithItems = Order & {
    order_items: OrderItem[];
    profiles: { full_name: string } | null;
  };
  const order = rawOrder as OrderWithItems | null;
  
  if (!order) notFound();

  const refNumber = order.order_number.replace('ORD-', 'PRE-');
  const expirationDate = new Date(new Date(order.created_at).getTime() + 7 * 24 * 60 * 60 * 1000);

  return (
    <div className="bg-white min-h-screen text-slate-800 p-8 max-w-4xl mx-auto font-sans antialiased">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">PescaShop</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Artículos de Pesca y Aventura</p>
          <div className="text-xs text-slate-500 mt-4 space-y-0.5">
            <p>Dirección Comercial: Av. Costanera 1234</p>
            <p>Email: ventas@pescashop.com</p>
            <p>Teléfono: +54 (11) 5555-0199</p>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl inline-block font-bold text-sm mb-4">
            PRESUPUESTO
          </div>
          <h2 className="text-lg font-mono font-bold text-slate-700">#{refNumber}</h2>
          <div className="text-xs text-slate-500 mt-3 space-y-1">
            <p><span className="font-semibold text-slate-700">Fecha Emisión:</span> {formatDate(order.created_at)}</p>
            <p><span className="font-semibold text-rose-600">Vence:</span> {formatDate(expirationDate.toISOString())}</p>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 mb-8 grid grid-cols-2 gap-6">
        <div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Cliente</h3>
          <p className="font-bold text-slate-800">
            {(order.profiles as { full_name: string } | null)?.full_name ?? order.shipping_name ?? "Cliente Web"}
          </p>
          <p className="text-sm text-slate-500 mt-1">{order.shipping_email ?? "Sin email registrado"}</p>
          {order.shipping_phone && (
            <p className="text-sm text-slate-500">{order.shipping_phone}</p>
          )}
        </div>
        <div className="flex flex-col justify-end text-right text-xs text-slate-400 space-y-1">
          <p>Este presupuesto no representa una factura ni un compromiso de compra.</p>
          <p>Los precios están expresados en pesos argentinos y se garantizan por el período de validez.</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-slate-100 rounded-3xl overflow-hidden mb-8 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <th className="text-left px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Producto</th>
              <th className="text-center px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Cantidad</th>
              <th className="text-right px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Precio Unit.</th>
              <th className="text-right px-6 py-4 font-bold uppercase tracking-wider text-[10px]">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {order.order_items.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-900">{item.product_name}</p>
                  {item.sku && (
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">SKU: {item.sku}</p>
                  )}
                </td>
                <td className="px-6 py-5 text-center font-semibold text-slate-700">
                  {item.quantity}
                </td>
                <td className="px-6 py-5 text-right font-semibold text-slate-700">
                  {formatCurrency(item.unit_price)}
                </td>
                <td className="px-6 py-5 text-right font-black text-slate-900">
                  {formatCurrency(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-slate-100 bg-slate-50/50">
            <tr>
              <td colSpan={3} className="px-6 py-5 text-right font-bold text-slate-500 uppercase tracking-widest text-[10px]">Total Cotizado</td>
              <td className="px-6 py-5 text-right font-black text-slate-950 text-xl">
                {formatCurrency(order.total)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Conditions and Notes */}
      <div className="border-t border-slate-200 pt-8 mt-12 grid grid-cols-2 gap-8 text-xs text-slate-500">
        <div>
          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">Condiciones Generales</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>Precios sujetos a variaciones sin previo aviso tras el vencimiento.</li>
            <li>Para confirmar el pedido, por favor comuníquese por teléfono o correo electrónico.</li>
            <li>El retiro o envío de mercadería está sujeto a disponibilidad de stock.</li>
          </ul>
        </div>
        <div className="text-right flex flex-col justify-end items-end">
          <p className="font-bold text-slate-800">Gracias por su preferencia</p>
          <p className="mt-1">PescaShop - Acompañamos tu pasión.</p>
        </div>
      </div>

      {/* Styles to hide admin sidebar on screen and print */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Hide sidebar on both screen and print for this route */
          aside {
            display: none !important;
          }
          main {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .min-h-screen {
            min-height: auto !important;
          }
          @media print {
            body, html {
              background: white !important;
            }
            @page {
              margin: 1.5cm;
            }
          }
        `
      }} />

      {/* Script to trigger browser print automatically and close page */}
      <script dangerouslySetInnerHTML={{
        __html: `
          window.onload = function() {
            window.print();
            setTimeout(() => {
              window.close();
            }, 500);
          }
        `
      }} />
    </div>
  );
}
