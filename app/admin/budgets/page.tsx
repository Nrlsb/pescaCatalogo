export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import BudgetsClient from "@/components/admin/BudgetsClient";
import type { Order, Product } from "@/types/database";
import { getDolarCotizacion } from "@/lib/dolar";

export default async function BudgetsPage() {
  const supabase = await createClient();
  
  // Fetch budgets (pending orders)
  const { data: budgetsData } = await supabase
    .from("orders")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  // Fetch all products securely from server side
  const { data: productsData } = await supabase
    .from("products")
    .select("*")
    .order("name");
  
  // Obtener cotización de dólar BNA para conversión automática
  const cotizacion = await getDolarCotizacion();
  
  // Convertir los precios de USD a ARS
  const convertedProducts = ((productsData as Product[]) || []).map((p) => ({
    ...p,
    price: Math.round(p.price * cotizacion),
    compare_at_price: p.compare_at_price ? Math.round(p.compare_at_price * cotizacion) : null,
  }));
  
  return (
    <BudgetsClient 
      initialBudgets={(budgetsData as Order[]) || []} 
      products={convertedProducts} 
    />
  );
}
