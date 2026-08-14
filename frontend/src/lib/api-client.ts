import apiClient from "@/lib/api";
import type { DashboardSummary, InventoryAlert, InventoryMovement, OrderStatusData } from "@/types/admin";

export interface User {
  id: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post<AuthResponse>("/auth/login", { email, password }),

  register: (email: string, password: string, role: string = "STOREKEEPER") =>
    apiClient.post<AuthResponse>("/auth/register", { email, password, role }),
  forgotPassword: (email: string) => apiClient.post(`/auth/forgot-password`, { email }),
};

export interface Product {
  id: string;
  type: "TIRE" | "RIM" | "SERVICE";
  name: string;
  importPrice: number;
  sellingPrice?: number;
  quantityInStock: number;
  imageUrl?: string;
  description?: string;
  condition?: "NEW" | "NEW_100" | "USED";
  brand?: string;
  size?: string;
}

export const productsAPI = {
  getAll: (condition?: string) => apiClient.get<Product[]>("/products", { params: condition ? { condition } : undefined }),
  getOne: (id: string) => apiClient.get<Product>(`/products/${id}`),

  create: (data: Partial<Product>) => apiClient.post<Product>("/products", data),

  update: (id: string, data: Partial<Product>) =>
    apiClient.patch<Product>(`/products/${id}`, data),

  delete: (id: string) => apiClient.delete(`/products/${id}`),
};

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
}

export const clientsAPI = {
  getAll: () => apiClient.get<Client[]>("/clients"),

  create: (data: Partial<Client>) => apiClient.post<Client>("/clients", data),

  update: (id: string, data: Partial<Client>) =>
    apiClient.patch<Client>(`/clients/${id}`, data),

  delete: (id: string) => apiClient.delete(`/clients/${id}`),
};

export interface Post {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  published?: boolean;
}

export const postsAPI = {
  getAll: () => apiClient.get<Post[]>("/posts"),
  getOne: (id: string) => apiClient.get<Post>(`/posts/${id}`),

  create: (data: Partial<Post>) => apiClient.post<Post>("/posts", data),

  update: (id: string, data: Partial<Post>) =>
    apiClient.patch<Post>(`/posts/${id}`, data),

  delete: (id: string) => apiClient.delete(`/posts/${id}`),
};

export interface Order {
  id: string;
  clientId: string;
  totalAmount: number;
  status: "PENDING" | "PAID" | "FAILED";
  stripeSessionId?: string;
}

export const ordersAPI = {
  getAll: () => apiClient.get<Order[]>("/orders"),

  create: (data: Partial<Order>) => apiClient.post<Order>("/orders", data),

  createCheckoutSession: (items: any[]) =>
    apiClient.post<{ sessionId: string; url: string }>(
      "/orders/checkout-session",
      { items }
    ),
};

export const adminDashboardAPI = {
  summary: () => apiClient.get<DashboardSummary>("/admin/dashboard/summary"),
  lowStock: () => apiClient.get<InventoryAlert[]>("/admin/dashboard/low-stock"),
  inventoryMovement: (range: "7d" | "30d" | "3m" | "6m" | "12m") => apiClient.get<InventoryMovement[]>("/admin/dashboard/inventory-movement", { params: { range } }),
  orderStatus: () => apiClient.get<OrderStatusData[]>("/admin/dashboard/order-status"),
};

export interface StockLocationRow { id: string; quantity: number; location: { locationCode: string; capacity: number; warehouse?: { code: string; name: string } }; product?: { id: string; sku: string; name: string; type: string }; wheelRim?: { id: string; sku: string; size: string; brand?: string | null }; }
export const inventoryAPI = {
  stockSummary: () => apiClient.get<StockLocationRow[]>("/inventory/stocks/summary"),
};

export interface PriceMatrixProduct { id: string; sku: string; name: string; sellingPrice: number | null; priceMatrix: { id: string; customerType: string; price: number }[]; }
export const adminManagementAPI = {
  priceMatrix: () => apiClient.get<PriceMatrixProduct[]>("/admin/management/price-matrix"),
  updatePriceMatrix: (productId: string, customerType: "RETAIL" | "B2B_TIER1" | "B2B_TIER2", price: number) => apiClient.post("/admin/management/price-matrix", { productId, customerType, price }),
  reports: () => apiClient.get<{ revenue: number; paidOrders: number; averageOrderValue: number; inventoryCost: number; topClients: { id: string; name: string; type: string; revenue: number; orders: number }[] }>("/admin/reports"),
};
