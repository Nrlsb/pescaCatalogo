export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import StockAdjustForm from "@/components/admin/StockAdjustForm";

export default async function InventoryAdjustPage() {
    const supabase = await createClient();

    // Obtener productos con sus variantes
    const { data: products } = await supabase
        .from("products")
        .select(`
      id,
      name,
      sku,
      product_variants (
        id,
        name,
        sku
      )
    `)
        .eq("is_active", true)
        .order("name");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const productsWithVariants = (products || []) as any[];

    return (
        <div className="p-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Ajuste manual de stock</h1>
                <p className="text-gray-500 mt-1">
                    Registra ingresos, egresos o ajustes de stock para cualquier producto o variante.
                </p>
            </div>

            <StockAdjustForm products={productsWithVariants} />
        </div>
    );
}
