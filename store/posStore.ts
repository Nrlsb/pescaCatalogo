"use client";

import { create } from "zustand";
import type { CartItem } from "@/types/cart";

interface PosStore {
  items: CartItem[];
  paymentMethod: "cash" | "card" | "transfer";
  cashReceived: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    variantId: string | undefined,
    quantity: number
  ) => void;
  clearSale: () => void;
  setPaymentMethod: (method: "cash" | "card" | "transfer") => void;
  setCashReceived: (amount: number) => void;
  subtotal: () => number;
  change: () => number;
  itemCount: () => number;
}

export const usePosStore = create<PosStore>()((set, get) => ({
  items: [],
  paymentMethod: "cash",
  cashReceived: 0,

  addItem: (newItem) => {
    set((state) => {
      const existing = state.items.find(
        (i) =>
          i.productId === newItem.productId && i.variantId === newItem.variantId
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === newItem.productId && i.variantId === newItem.variantId
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { ...newItem, quantity: 1 }] };
    });
  },

  removeItem: (productId, variantId) => {
    set((state) => ({
      items: state.items.filter(
        (i) => !(i.productId === productId && i.variantId === variantId)
      ),
    }));
  },

  updateQuantity: (productId, variantId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId, variantId);
      return;
    }
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId && i.variantId === variantId
          ? { ...i, quantity }
          : i
      ),
    }));
  },

  clearSale: () =>
    set({ items: [], paymentMethod: "cash", cashReceived: 0 }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setCashReceived: (amount) => set({ cashReceived: amount }),

  subtotal: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  change: () => {
    const total = get().subtotal();
    const cash = get().cashReceived;
    return Math.max(0, cash - total);
  },

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
