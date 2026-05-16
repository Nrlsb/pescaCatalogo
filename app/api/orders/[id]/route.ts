import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items (*), profiles!orders_customer_id_fkey (full_name)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const body = await request.json();

  // 1. Obtener estado actual del pedido con sus items
  const { data: order, error: fetchError } = await (supabase as any)
    .from("orders")
    .select("*, order_items (*)")
    .eq("id", id)
    .single();

  if (fetchError || !order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const oldStatus = order.status;
  const newStatus = body.status || oldStatus;

  // 2. Actualizar el pedido
  const updateData: Record<string, string> = {};
  if (body.status) updateData.status = body.status;
  if (body.payment_status) updateData.payment_status = body.payment_status;

  const { error: updateError } = await (supabase as any)
    .from("orders")
    .update(updateData)
    .eq("id", id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  // 3. Gestionar inventario según la transición de estado
  const db = supabase as any;

  // Transición a ENTREGADO: Descontar stock (si no estaba entregado antes)
  if (oldStatus !== "delivered" && newStatus === "delivered") {
    for (const item of order.order_items) {
      // Buscar fila de inventario
      const { data: inv } = await db
        .from("inventory")
        .select("id, quantity")
        .eq("product_id", item.product_id)
        .eq("variant_id", item.variant_id)
        .maybeSingle();

      if (inv) {
        await db
          .from("inventory")
          .update({ quantity: Math.max(0, inv.quantity - item.quantity) })
          .eq("id", inv.id);
      }

      // Registrar movimiento
      await db.from("inventory_movements").insert({
        product_id: item.product_id,
        variant_id: item.variant_id,
        delta: -item.quantity,
        reason: order.channel === "pos" ? "sale_pos" : "sale_online",
        reference_id: order.id,
        created_by: user?.id ?? null,
        notes: `Cambio de estado: ${oldStatus} -> ${newStatus}`,
      });
    }
  }
  // Transición de ENTREGADO a CANCELADO/REEMBOLSADO: Devolver stock
  else if (oldStatus === "delivered" && (newStatus === "cancelled" || newStatus === "refunded")) {
    for (const item of order.order_items) {
      const { data: inv } = await db
        .from("inventory")
        .select("id, quantity")
        .eq("product_id", item.product_id)
        .eq("variant_id", item.variant_id)
        .maybeSingle();

      if (inv) {
        await db
          .from("inventory")
          .update({ quantity: inv.quantity + item.quantity })
          .eq("id", inv.id);
      } else {
        // Si no existe la fila, la creamos con la cantidad devuelta
        await db.from("inventory").insert({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity,
        });
      }

      // Registrar movimiento
      await db.from("inventory_movements").insert({
        product_id: item.product_id,
        variant_id: item.variant_id,
        delta: item.quantity,
        reason: "return",
        reference_id: order.id,
        created_by: user?.id ?? null,
        notes: `Cambio de estado: ${oldStatus} -> ${newStatus} (Devolución de stock)`,
      });
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  try {
    // 1. Eliminar items de la orden
    const { error: itemsError } = await supabase
      .from("order_items")
      .delete()
      .eq("order_id", id);

    if (itemsError) throw new Error(itemsError.message);

    // 2. Eliminar la orden
    const { error: orderError } = await supabase
      .from("orders")
      .delete()
      .eq("id", id);

    if (orderError) throw new Error(orderError.message);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

