export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import BudgetsClient from "@/components/admin/BudgetsClient";
import type { Order, Product } from "@/types/database";

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
  
  return (
    <BudgetsClient 
      initialBudgets={(budgetsData as Order[]) || []} 
      products={(productsData as Product[]) || []} 
    />
  );
}
