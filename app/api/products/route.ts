import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { Product } from "@/types/database";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");
  const category = searchParams.get("category");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query: any = supabase
    .from("products")
    .select("*, categories (name, slug), inventory (quantity)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("name", `%${q}%`);
  if (category) query = query.eq("category_id", category);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { variants, initial_stock, ...productData } = body;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  // Insert product
  const { data: rawProduct, error } = await db
    .from("products")
    .insert(productData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const product = rawProduct as Product;

  // Insert variants if any
  if (variants && variants.length > 0) {
    const variantData = variants.map(
      (v: { name: string; sku: string; price_delta: number }, i: number) => ({
        product_id: product.id,
        name: v.name,
        sku: v.sku || null,
        price_delta: v.price_delta || 0,
        sort_order: i,
      })
    );
    const { data: rawVariants } = await db
      .from("product_variants")
      .insert(variantData)
      .select();

    if (rawVariants) {
      const createdVariants = rawVariants as { id: string }[];
      await db.from("inventory").insert(
        createdVariants.map((v) => ({
          product_id: product.id,
          variant_id: v.id,
          quantity: initial_stock ?? 0,
        }))
      );
    }
  } else {
    await db.from("inventory").insert({
      product_id: product.id,
      quantity: initial_stock ?? 0,
    });
  }

  return NextResponse.json({ id: product.id }, { status: 201 });
}
