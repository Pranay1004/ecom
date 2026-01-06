import { create } from "zustand";

export interface OrderItem {
  fileName: string;
  process: string;
  material: string;
  tolerance: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  fileHash: string;
}

export interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  shipping: ShippingInfo;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  status: "draft" | "pending_payment" | "paid" | "processing" | "shipped" | "delivered";
  createdAt: string;
  paymentMethod?: string;
  paymentId?: string;
}

interface OrderState {
  currentOrder: Order | null;
  orderHistory: Order[];
  
  // Actions
  createOrder: (items: OrderItem[], shipping: ShippingInfo) => Order;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  setPaymentInfo: (orderId: string, method: string, paymentId: string) => void;
  clearCurrentOrder: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  currentOrder: null,
  orderHistory: [],

  createOrder: (items, shipping) => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const shippingCost = subtotal > 5000 ? 0 : 150; // Free shipping over ₹5000
    const tax = subtotal * 0.18; // 18% GST
    const total = subtotal + shippingCost + tax;

    const order: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      items,
      shipping,
      subtotal,
      shippingCost,
      tax,
      total,
      status: "draft",
      createdAt: new Date().toISOString(),
    };

    set({ currentOrder: order });
    return order;
  },

  updateOrderStatus: (orderId, status) => {
    set((state) => {
      if (state.currentOrder?.id === orderId) {
        const updatedOrder = { ...state.currentOrder, status };
        return {
          currentOrder: updatedOrder,
          orderHistory: state.orderHistory.map((o) =>
            o.id === orderId ? updatedOrder : o
          ),
        };
      }
      return state;
    });
  },

  setPaymentInfo: (orderId, method, paymentId) => {
    set((state) => {
      if (state.currentOrder?.id === orderId) {
        const updatedOrder = {
          ...state.currentOrder,
          paymentMethod: method,
          paymentId,
          status: "paid" as const,
        };
        return {
          currentOrder: updatedOrder,
          orderHistory: [...state.orderHistory, updatedOrder],
        };
      }
      return state;
    });
  },

  clearCurrentOrder: () => set({ currentOrder: null }),
}));
