export const ORDER_STATUSES = [
  { value: "pending", label: "Pendiente", color: "yellow" },
  { value: "confirmed", label: "Confirmado", color: "blue" },
  { value: "processing", label: "En proceso", color: "indigo" },
  { value: "shipped", label: "Enviado", color: "purple" },
  { value: "delivered", label: "Entregado", color: "green" },
  { value: "cancelled", label: "Cancelado", color: "red" },
  { value: "refunded", label: "Reembolsado", color: "gray" },
] as const;

export const PAYMENT_STATUSES = [
  { value: "pending", label: "Pendiente", color: "yellow" },
  { value: "paid", label: "Pagado", color: "green" },
  { value: "failed", label: "Fallido", color: "red" },
  { value: "refunded", label: "Reembolsado", color: "gray" },
] as const;

export const PAYMENT_METHODS = [
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "transfer", label: "Transferencia" },
  { value: "mercadopago", label: "MercadoPago" },
] as const;

export const STOCK_STATUSES = [
  { value: "in_stock", label: "En stock", color: "green" },
  { value: "low_stock", label: "Stock bajo", color: "yellow" },
  { value: "out_of_stock", label: "Sin stock", color: "red" },
] as const;

export const MOVEMENT_REASONS = [
  { value: "sale_online", label: "Venta online" },
  { value: "sale_pos", label: "Venta presencial" },
  { value: "purchase", label: "Compra/Ingreso" },
  { value: "adjustment", label: "Ajuste manual" },
  { value: "return", label: "Devolución" },
  { value: "damage", label: "Daño/Pérdida" },
] as const;
