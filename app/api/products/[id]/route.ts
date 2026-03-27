import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants (*), inventory (*)")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json(data);
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const body = await request.json();
  const { variants, ...productData } = body;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { error } = await db
    .from("products")
    .update(productData)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Handle variants: delete existing and re-insert
  if (variants !== undefined) {
    await db.from("product_variants").delete().eq("product_id", id);
    if (variants.length > 0) {
      await db.from("product_variants").insert(
        variants.map(
          (v: { name: string; sku: string; price_delta: number }, i: number) => ({
            product_id: id,
            name: v.name,
            sku: v.sku || null,
            price_delta: v.price_delta || 0,
            sort_order: i,
          })
        )
      );
    }
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
