import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { CartItem } from "@/types/cart";
import type { Order } from "@/types/database";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const channel = searchParams.get("channel");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from("orders")
    .select("*, profiles (full_name)")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (channel) query = query.eq("channel", channel);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();
  const { items, shipping, paymentMethod, subtotal, total } = body;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: rawOrder, error } = await (supabase as any)
    .from("orders")
    .insert({
      customer_id: user?.id ?? null,
      channel: "online" as const,
      status: "pending" as const,
      shipping_name: shipping.name,
      shipping_email: shipping.email,
      shipping_phone: shipping.phone,
      shipping_address: {
        line1: shipping.address,
        city: shipping.city,
        province: shipping.province,
        postal_code: shipping.postal_code,
      },
      subtotal: Number(subtotal),
      total: Number(total),
      payment_method: paymentMethod,
      payment_status: "pending" as const,
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: itemsError } = await (supabase as any)
    .from("order_items")
    .insert(orderItems);

  if (itemsError)
    return NextResponse.json({ error: itemsError.message }, { status: 500 });

  return NextResponse.json(
    { orderId: order.id, orderNumber: order.order_number },
    { status: 201 }
  );
}
