import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();
  const { product_id, variant_id, delta, reason, notes } = body;

  if (!product_id || delta === undefined || !reason) {
    return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Get current inventory row
  const { data: current } = await db
    .from("inventory")
    .select("id, quantity")
    .eq("product_id", product_id)
    .eq("variant_id", variant_id ?? null)
    .maybeSingle();

  const inv = current as { id: string; quantity: number } | null;

  if (!inv) {
    await db.from("inventory").insert({
      product_id,
      variant_id: variant_id ?? null,
      quantity: Math.max(0, delta),
    });
  } else {
    const newQuantity = Math.max(0, inv.quantity + delta);
    const { error } = await db
      .from("inventory")
      .update({ quantity: newQuantity })
      .eq("id", inv.id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Log movement
  await db.from("inventory_movements").insert({
    product_id,
    variant_id: variant_id ?? null,
    delta,
    reason,
    notes: notes ?? null,
    created_by: user?.id ?? null,
  });

  return NextResponse.json({ success: true });
}
