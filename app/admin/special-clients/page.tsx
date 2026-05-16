export const dynamic = "force-dynamic";
import { createClient } from "@/lib/supabase/server";
import SpecialClientsClient from "@/components/admin/SpecialClientsClient";
import type { Profile } from "@/types/database";

export default async function SpecialClientsPage() {
  const supabase = await createClient();
  
  // Fetch all customers securely from server side
  const { data: rawCustomers } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });
  
  return (
    <SpecialClientsClient 
      initialCustomers={(rawCustomers as Profile[]) || []} 
    />
  );
}
