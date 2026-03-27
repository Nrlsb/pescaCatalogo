export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: "customer" | "staff" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: "customer" | "staff" | "admin";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: "customer" | "staff" | "admin";
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          parent_id: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          parent_id?: string | null;
          sort_order?: number;
          is_active?: boolean;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          sku: string | null;
          brand: string | null;
          price: number;
          compare_at_price: number | null;
          cost_price: number | null;
          weight_grams: number | null;
          images: string[];
          is_active: boolean;
          is_featured: boolean;
          low_stock_threshold: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          sku?: string | null;
          brand?: string | null;
          price: number;
          compare_at_price?: number | null;
          cost_price?: number | null;
          weight_grams?: number | null;
          images?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          low_stock_threshold?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          sku?: string | null;
          brand?: string | null;
          price?: number;
          compare_at_price?: number | null;
          cost_price?: number | null;
          weight_grams?: number | null;
          images?: string[];
          is_active?: boolean;
          is_featured?: boolean;
          low_stock_threshold?: number;
          updated_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          sku: string | null;
          price_delta: number;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          sku?: string | null;
          price_delta?: number;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          sku?: string | null;
          price_delta?: number;
          sort_order?: number;
        };
      };
      inventory: {
        Row: {
          id: string;
          product_id: string;
          variant_id: string | null;
          quantity: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          variant_id?: string | null;
          quantity?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          variant_id?: string | null;
          quantity?: number;
          updated_at?: string;
        };
      };
      inventory_movements: {
        Row: {
          id: string;
          product_id: string;
          variant_id: string | null;
          delta: number;
          reason:
            | "sale_online"
            | "sale_pos"
            | "purchase"
            | "adjustment"
            | "return"
            | "damage";
          reference_id: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          variant_id?: string | null;
          delta: number;
          reason:
            | "sale_online"
            | "sale_pos"
            | "purchase"
            | "adjustment"
            | "return"
            | "damage";
          reference_id?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          delta?: number;
          reason?:
            | "sale_online"
            | "sale_pos"
            | "purchase"
            | "adjustment"
            | "return"
            | "damage";
          notes?: string | null;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          channel: "online" | "pos";
          status:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled"
            | "refunded";
          shipping_name: string | null;
          shipping_email: string | null;
          shipping_phone: string | null;
          shipping_address: Json | null;
          shipping_method: string | null;
          shipping_cost: number;
          subtotal: number;
          discount_amount: number;
          tax_amount: number;
          total: number;
          payment_method: string | null;
          payment_status: "pending" | "paid" | "failed" | "refunded";
          payment_reference: string | null;
          pos_cashier_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          customer_id?: string | null;
          channel?: "online" | "pos";
          status?:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled"
            | "refunded";
          shipping_name?: string | null;
          shipping_email?: string | null;
          shipping_phone?: string | null;
          shipping_address?: Json | null;
          shipping_method?: string | null;
          shipping_cost?: number;
          subtotal: number;
          discount_amount?: number;
          tax_amount?: number;
          total: number;
          payment_method?: string | null;
          payment_status?: "pending" | "paid" | "failed" | "refunded";
          payment_reference?: string | null;
          pos_cashier_id?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?:
            | "pending"
            | "confirmed"
            | "processing"
            | "shipped"
            | "delivered"
            | "cancelled"
            | "refunded";
          payment_status?: "pending" | "paid" | "failed" | "refunded";
          payment_reference?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string;
          variant_id: string | null;
          product_name: string;
          variant_name: string | null;
          sku: string | null;
          quantity: number;
          unit_price: number;
          subtotal: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id: string;
          variant_id?: string | null;
          product_name: string;
          variant_name?: string | null;
          sku?: string | null;
          quantity: number;
          unit_price: number;
          subtotal: number;
          created_at?: string;
        };
        Update: never;
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          type: "percent" | "fixed";
          value: number;
          min_order_amount: number | null;
          max_uses: number | null;
          used_count: number;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          type: "percent" | "fixed";
          value: number;
          min_order_amount?: number | null;
          max_uses?: number | null;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          type?: "percent" | "fixed";
          value?: number;
          min_order_amount?: number | null;
          max_uses?: number | null;
          used_count?: number;
          expires_at?: string | null;
          is_active?: boolean;
        };
      };
    };
    Views: {
      product_stock: {
        Row: {
          product_id: string;
          name: string;
          sku: string | null;
          low_stock_threshold: number;
          total_stock: number;
          stock_status: "in_stock" | "low_stock" | "out_of_stock";
        };
      };
      daily_sales: {
        Row: {
          sale_date: string;
          channel: "online" | "pos";
          order_count: number;
          revenue: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type ProductVariant =
  Database["public"]["Tables"]["product_variants"]["Row"];
export type Inventory = Database["public"]["Tables"]["inventory"]["Row"];
export type InventoryMovement =
  Database["public"]["Tables"]["inventory_movements"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];
export type Coupon = Database["public"]["Tables"]["coupons"]["Row"];
export type ProductStock = Database["public"]["Views"]["product_stock"]["Row"];
export type DailySales = Database["public"]["Views"]["daily_sales"]["Row"];
