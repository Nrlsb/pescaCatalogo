import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  
  try {
    const body = await request.json();
    const { customerName, customerEmail, items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No hay ítems en el presupuesto" }, { status: 400 });
    }

    // Calculate total
    const total = items.reduce((acc: number, item: any) => acc + (item.customPrice * item.quantity), 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    // Create order
    const { data: order, error: orderError } = await db
      .from("orders")
      .insert({
        channel: "pos",
        status: "pending",
        shipping_name: customerName,
        shipping_email: customerEmail,
        subtotal: total,
        total: total,
        payment_status: "pending",
      })
      .select()
      .single();

    if (orderError) throw new Error(orderError.message);

    // Get product names for order_items
    const productIds = items.map((item: any) => item.productId);
    const { data: products } = await db
      .from("products")
      .select("id, name, sku")
      .in("id", productIds);

    const orderItems = items.map((item: any) => {
      const product = products?.find((p: any) => p.id === item.productId);
      return {
        order_id: order.id,
        product_id: item.productId,
        product_name: product?.name || "Producto desconocido",
        sku: product?.sku || null,
        quantity: item.quantity,
        unit_price: item.customPrice,
        subtotal: item.customPrice * item.quantity,
      };
    });

    const { error: itemsError } = await db.from("order_items").insert(orderItems);

    if (itemsError) throw new Error(itemsError.message);

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (error: any) {
    console.error("Error creating budget:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
