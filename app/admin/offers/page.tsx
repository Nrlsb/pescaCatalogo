export const dynamic = "force-dynamic";

import { createClient } from "@/lib/supabase/server";
import { getDolarCotizacion } from "@/lib/dolar";
import OffersClient from "@/components/admin/OffersClient";
import Link from "next/link";
import { Plus, Percent } from "lucide-react";

export const metadata = {
  title: "Control de Ofertas | Panel Admin",
};

export default async function AdminOffersPage() {
  const supabase = await createClient();

  // Obtener cotización de dólar BNA para conversiones
  const cotizacion = await getDolarCotizacion();

  // Obtener todos los productos con ofertas configuradas (precio de oferta no nulo)
  const { data: rawProducts, error } = await supabase
    .from("products")
    .select("id, name, sku, brand, images, price, compare_at_price, currency, offer_price, offer_start, offer_end")
    .not("offer_price", "is", null)
    .order("created_at", { ascending: false });

  const offers = (rawProducts || []) as any[];

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <Percent className="text-blue-700" size={32} />
            Control de Ofertas
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona, programa y supervisa todos los descuentos temporales en la tienda
          </p>
        </div>
        
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-2 bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={18} />
          Programar Nueva Oferta
        </Link>
      </div>

      <OffersClient initialOffers={offers} cotizacion={cotizacion} />
    </div>
  );
}
