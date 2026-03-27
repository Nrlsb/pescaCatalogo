import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { CartItem } from "@/types/cart";
import type { Order } from "@/types/database";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();
  const { items, total, paymentMethod } = body;

  if (!items || items.length === 0) {
    return NextResponse.json({ error: "No hay productos" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Create order
  const { data: rawOrder, error } = await db
    .from("orders")
    .insert({
      channel: "pos" as const,
      status: "delivered" as const,
      subtotal: Number(total),
      total: Number(total),
      payment_method: paymentMethod,
      payment_status: "paid" as const,
      pos_cashier_id: user?.id ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const order = rawOrder as Order;

  // Insert order items
  const orderItems = items.map((item: CartItem) => ({
    order_id: order.id,
    product_id: item.productId,
    variant_id: item.variantId ?? null,
    product_name: item.name,
    variant_name: item.variantName ?? null,
    sku: item.sku ?? null,
    quantity: item.quantity,
    unit_price: item.price,
    subtotal: item.price * item.quantity,
  }));

  await db.from("order_items").insert(orderItems);

  // Manually decrement inventory for POS (trigger fires on payment_status transition, not INSERT)
  for (const item of items as CartItem[]) {
    const { data: rawInv } = await db
      .from("inventory")
      .select("id, quantity")
      .eq("product_id", item.productId)
      .eq("variant_id", item.variantId ?? null)
      .maybeSingle();

    const inv = rawInv as { id: string; quantity: number } | null;

    if (inv) {
      await db
        .from("inventory")
        .update({ quantity: Math.max(0, inv.quantity - item.quantity) })
        .eq("id", inv.id);
    }

    await db.from("inventory_movements").insert({
      product_id: item.productId,
      variant_id: item.variantId ?? null,
      delta: -item.quantity,
      reason: "sale_pos",
      reference_id: order.id,
      created_by: user?.id ?? null,
    });
  }

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.order_number,
  });
}
