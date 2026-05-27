import apiClient from "@/lib/api";

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

  register: (email: string, password: string, role: string = "ADMIN") =>
    apiClient.post<User>("/auth/register", { email, password, role }),
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
}

export const productsAPI = {
  getAll: () => apiClient.get<Product[]>("/products"),

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
  published: boolean;
}

export const postsAPI = {
  getAll: () => apiClient.get<Post[]>("/posts"),

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
