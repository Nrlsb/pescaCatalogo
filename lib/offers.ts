import type { Product } from "@/types/database";

/**
 * Verifica si un producto tiene una oferta programada activa en el momento actual.
 */
export function isOfferActive(product: any): boolean {
  if (!product) return false;
  if (product.offer_price === undefined || product.offer_price === null || product.offer_price <= 0) {
    return false;
  }

  const now = new Date();
  
  if (product.offer_start) {
    const startDate = new Date(product.offer_start);
    if (now < startDate) return false; // Aún no empieza
  }
  
  if (product.offer_end) {
    const endDate = new Date(product.offer_end);
    if (now > endDate) return false; // Ya terminó
  }

  // Si tiene precio de oferta y las fechas (si existen) están en rango
  return true;
}

/**
 * Procesa los precios de un producto aplicando la oferta programada si está activa,
 * y realizando la conversión de moneda (USD a ARS) en base a la cotización provista.
 */
export function processProductPrices<T extends Record<string, any>>(
  product: T,
  cotizacion: number
): T {
  if (!product) return product;

  const isUSD = product.currency === "USD" || !product.currency;
  const rate = isUSD ? cotizacion : 1;

  const active = isOfferActive(product);

  if (active && product.offer_price !== null && product.offer_price !== undefined) {
    // Si la oferta está activa:
    // El precio tachado (compare_at_price) es el precio normal del producto
    // El precio actual es el precio de la oferta
    return {
      ...product,
      price: Math.round(product.offer_price * rate),
      compare_at_price: Math.round(product.price * rate),
      _original_price: product.price, // Guardamos los precios base sin cotización por si se necesitan
      _original_compare_price: product.compare_at_price,
      _original_offer_price: product.offer_price,
      _is_offer_active: true,
    };
  } else {
    // Si la oferta NO está activa, se procesan los precios normales
    return {
      ...product,
      price: Math.round(product.price * rate),
      compare_at_price: product.compare_at_price ? Math.round(product.compare_at_price * rate) : null,
      _original_price: product.price,
      _original_compare_price: product.compare_at_price,
      _original_offer_price: product.offer_price,
      _is_offer_active: false,
    };
  }
}

/**
 * Procesa un listado de productos aplicando la oferta programada y la cotización de dólar.
 */
export function processProductsList<T extends Record<string, any>>(
  products: T[] | null,
  cotizacion: number
): T[] | null {
  if (!products) return null;
  return products.map((p) => processProductPrices(p, cotizacion));
}
