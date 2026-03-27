export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
}

export interface Cart {
  items: CartItem[];
  couponCode?: string;
  couponDiscount?: number;
}
