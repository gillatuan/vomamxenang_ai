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
  sku: string;
  type: "TIRE" | "RIM" | "SERVICE";
  name: string;
  importPrice?: number;
  sellingPrice?: number;
  minStock?: number;
  maxStock?: number;
  imageUrl?: string;
  shortDescription?: string;
  description?: string;
  highlights?: string[];
  specifications?: Array<{ label: string; value: string }>;
  applications?: string[];
  condition?: "NEW" | "NEW_100" | "USED";
  brand?: string;
  size?: string;
  tireType?: string;
  status?: ContentStatus;
  slug?: string;
  seo?: SeoMetadata;
  tags?: string[];
}

export type ContentStatus = "DRAFT" | "PUBLISHED";

export interface SeoMetadata {
  imageAlt?: string;
  imageUrl?: string;
  title?: string;
  description?: string;
  keywords?: string[];
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  canonicalPath?: string;
  robots?: "index,follow" | "noindex,nofollow" | "noindex,follow";
  openGraph?: { title?: string; description?: string; type?: "product" | "article" };
  twitter?: { card?: "summary_large_image"; title?: string; description?: string };
}

export type ProductResearchStatus = "RESEARCHING"|"READY_FOR_REVIEW"|"APPROVED"|"REJECTED"|"PUBLISHED";
export interface ProductContentResearch { id:string;productId:string;status:ProductResearchStatus;sources:Array<{url:string;title?:string;sourceType?:string}>;facts:Array<{field:string;value:string;source?:string;evidence?:string}>;proposedContent:Partial<Product>;reviewedBy?:string;reviewedAt?:string;publishedAt?:string;createdAt:string; }
export const productResearchAPI = {
  list:(productId:string)=>apiClient.get<ProductContentResearch[]>(`/admin/product-research/product/${productId}`),
  research:(productId:string)=>apiClient.post<ProductContentResearch>(`/admin/product-research/product/${productId}/auto`),
  create:(productId:string,data:Pick<ProductContentResearch,"sources"|"facts"|"proposedContent">)=>apiClient.post<ProductContentResearch>(`/admin/product-research/product/${productId}`,data),
  review:(id:string,action:"APPROVE"|"REJECT")=>apiClient.post<ProductContentResearch>(`/admin/product-research/${id}/review`,{action}),
  apply:(id:string)=>apiClient.post<Product>(`/admin/product-research/${id}/apply`),
};

export const productsAPI = {
  getAll: (condition?: string) => apiClient.get<Product[]>("/products", { params: condition ? { condition } : undefined }),
  getOne: (id: string) => apiClient.get<Product>(`/products/${id}`),

  create: (data: Partial<Product>) => apiClient.post<Product>("/products", data),

  update: (id: string, data: Partial<Product>) =>
    apiClient.patch<Product>(`/products/${id}`, data),

  delete: (id: string) => apiClient.delete(`/products/${id}`),
  featuredReviews: () => apiClient.get<{ id: string; content: string; rating: number | null; createdAt: string; product: { id: string; name: string }; reviewerName: string }[]>("/products/reviews/featured"),
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
  excerpt?: string;
  status?: ContentStatus;
  slug?: string;
  seo?: SeoMetadata;
  tags?: string[];
}

export const postsAPI = {
  getAll: () => apiClient.get<Post[]>("/posts"),
  getAllAdmin: () => apiClient.get<Post[]>("/posts/admin/all"),
  getOne: (id: string) => apiClient.get<Post>(`/posts/${id}`),

  create: (data: Partial<Post>) => apiClient.post<Post>("/posts", data),

  update: (id: string, data: Partial<Post>) =>
    apiClient.patch<Post>(`/posts/${id}`, data),

  delete: (id: string) => apiClient.delete(`/posts/${id}`),
};

export interface GeneratedProduct { name:string;slug:string;shortDescription:string;description:string;highlights:string[];specifications:{name:string;value:string}[];applications:string[];seo:{title:string;description:string;keywords:string[]};tags:string[];imageAltTexts:{imageIndex:number;alt:string}[];missingInformation:string[]; }
export interface GeneratedBlog { title:string;slug:string;excerpt:string;content:string;tableOfContents:{title:string;anchor:string}[];seo:{title:string;description:string;primaryKeyword:string;secondaryKeywords:string[]};tags:string[];imageAltTexts:{imageIndex:number;alt:string}[];relatedProductSuggestions:string[];missingInformation:string[]; }
export interface GeneratedSeo { title:string;metaDescription:string;slug:string;primaryKeyword:string;secondaryKeywords:string[];tags:string[];suggestedHeadings:string[];imageAltTexts:string[];suggestions:string[];ogTitle?:string;ogDescription?:string;canonicalPath?:string;robots?:"index,follow"|"noindex,nofollow"; }
export const aiAPI = {
  generateProduct:(payload:Record<string,unknown>)=>apiClient.post<GeneratedProduct>('/ai/generate/product',payload),
  generateBlog:(payload:Record<string,unknown>)=>apiClient.post<GeneratedBlog>('/ai/generate/blog',payload),
  generateSeo:(payload:Record<string,unknown>)=>apiClient.post<GeneratedSeo>('/ai/generate/seo',payload),
  saveProductDraft:(output:GeneratedProduct)=>apiClient.post('/ai/draft/product',output),
  saveBlogDraft:(output:GeneratedBlog)=>apiClient.post('/ai/draft/blog',output),
  applySeo:(payload:{sourceType:'PRODUCT'|'BLOG';sourceId:string;seo:GeneratedSeo})=>apiClient.post('/ai/apply/seo',payload),
};

export type DailyContentPlan = { id: string; slot: number; title: string; slug: string; primaryKeyword: string; secondaryKeywords: string[]; searchIntent: string; cluster: string; status: 'PLANNED'|'GENERATING'|'DRAFT'|'PUBLISHED'|'FAILED'; attempts: number; failureReason?: string | null; post?: { id: string; title: string; slug?: string | null; status: ContentStatus } | null; targetProduct?: { id: string; name: string; slug?: string | null } | null; quality?: { passed?: boolean; reasons?: string[]; wordCount?: number } | null; };
export type DailyContentRun = { id: string; runDate: string; status: 'RUNNING'|'COMPLETED'|'PARTIAL'|'FAILED'; startedAt: string; finishedAt?: string | null; error?: string | null; plans: DailyContentPlan[]; };
export const dailyContentAPI = {
  current: () => apiClient.get<DailyContentRun | null>('/admin/daily-content'),
  run: (runDate?: string) => apiClient.post<{ run: DailyContentRun; reused?: boolean; running?: boolean }>('/admin/daily-content/run', runDate ? { runDate } : {}),
};

export interface Order {
  id: string;
  code: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
    email?: string;
  };
  totalAmount: number;
  status: "PENDING" | "PAID" | "FAILED";
  stripeSessionId?: string;
  createdAt: string;
  items?: { id: string; quantity: number; price: number; product?: { sku: string; name: string } | null; wheelRim?: { sku: string; size: string } | null; location?: { locationCode: string } }[];
}

export const ordersAPI = {
  getAll: () => apiClient.get<Order[]>("/orders"),

  create: (data: Partial<Order>) => apiClient.post<Order>("/orders", data),
  updateStatus: (id: string, status: Order["status"]) => apiClient.patch<Order>(`/orders/${id}/status`, { status }),
  delete: (id: string) => apiClient.delete(`/orders/${id}`),

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

export const cacheAPI = {
  purge: (data: { scope: "ALL" | "PRODUCT" | "POST" | "PATH"; id?: string; path?: string }) =>
    apiClient.post<{ revalidated: boolean; paths: string[] }>("/admin/cache/purge", data),
};

export interface StockLocationRow { id: string; quantity: number; location: { locationCode: string; capacity: number; warehouse?: { code: string; name: string } }; product?: { id: string; sku: string; name: string; type: string }; wheelRim?: { id: string; sku: string; size: string; brand?: string | null }; }
export const inventoryAPI = {
  stockSummary: () => apiClient.get<StockLocationRow[]>("/inventory/stocks/summary"),
  logs: () => apiClient.get<{ id: string; quantity: number; price: number; transaction: { code: string; type: string; createdAt: string }; product?: { sku: string; name: string }; wheelRim?: { sku: string; size: string } }[]>("/inventory/logs"),
  assembly: () => apiClient.get<{ id: string; quantity: number; pressingFee: number; createdAt: string; product: { sku: string; name: string }; wheelRim: { sku: string; size: string; brand?: string | null } }[]>("/inventory/assembly"),
};

export interface WarehouseLocation { id: string; warehouseId: string; locationCode: string; zone: string; rack: string; slot: string; capacity: number; }
export interface Warehouse { id: string; code: string; name: string; locations?: WarehouseLocation[]; }
export const warehousesAPI = {
  map: () => apiClient.get<Warehouse[]>("/warehouse/map"),
  create: (data: { code: string; name: string }) => apiClient.post<Warehouse>("/warehouse", data),
  update: (id: string, data: Partial<{ code: string; name: string }>) => apiClient.patch<Warehouse>(`/warehouse/${id}`, data),
  delete: (id: string) => apiClient.delete(`/warehouse/${id}`),
  createLocation: (data: Omit<WarehouseLocation, "id">) => apiClient.post<WarehouseLocation>("/warehouse/locations", data),
  updateLocation: (id: string, data: Partial<Omit<WarehouseLocation, "id">>) => apiClient.patch<WarehouseLocation>(`/warehouse/locations/${id}`, data),
  deleteLocation: (id: string) => apiClient.delete(`/warehouse/locations/${id}`),
};

export interface PriceMatrixProduct { id: string; sku: string; name: string; sellingPrice: number | null; priceMatrix: { id: string; customerType: string; price: number }[]; }
export const adminManagementAPI = {
  products: () => apiClient.get<(Product & { importPrice: number; stocks: { quantity: number }[] })[]>("/admin/management/products"),
  priceMatrix: () => apiClient.get<PriceMatrixProduct[]>("/admin/management/price-matrix"),
  updatePriceMatrix: (productId: string, customerType: "RETAIL" | "B2B_TIER1" | "B2B_TIER2", price: number) => apiClient.post("/admin/management/price-matrix", { productId, customerType, price }),
  reports: () => apiClient.get<{ revenue: number; paidOrders: number; averageOrderValue: number; inventoryCost: number; topClients: { id: string; name: string; type: string; revenue: number; orders: number }[] }>("/admin/reports"),
  users: () => apiClient.get<{ id: string; email: string; role: string; createdAt: string }[]>("/admin/management/users"),
  createUser: (data: { email: string; password: string; role: "ADMIN_MANAGER" | "STOREKEEPER" }) => apiClient.post("/admin/management/users", data),
  updateUser: (id: string, data: { role?: "ADMIN_MANAGER" | "STOREKEEPER"; password?: string }) => apiClient.patch(`/admin/management/users/${id}`, data),
  deleteUser: (id: string) => apiClient.delete(`/admin/management/users/${id}`),
  productComments: () => apiClient.get<{ id: string; content: string; rating: number | null; createdAt: string; product: { sku: string; name: string }; user: { email: string } }[]>("/admin/management/product-comments"),
  deleteProductComment: (id: string) => apiClient.delete(`/admin/management/product-comments/${id}`),
  postComments: () => apiClient.get<{ id: string; content: string; createdAt: string; post: { title: string }; user: { email: string } }[]>("/admin/management/post-comments"),
  deletePostComment: (id: string) => apiClient.delete(`/admin/management/post-comments/${id}`),
  favourites: () => apiClient.get<{ product: { id: string; sku: string; name: string; brand: string | null }; favouriteCount: number }[]>("/admin/management/favourites"),
  wheelRims: () => apiClient.get<{ id: string; sku: string; size: string; boltHoles: number; brand: string | null; sellingPrice: number | null; stocks: { quantity: number }[] }[]>("/admin/management/wheel-rims"),
};

export const categoriesAPI = {
  getAll: () => apiClient.get<{ id: string; name: string; tireSize: string; brand: string; tireType: string; rimType: string; condition: string; origin: string; specifications?: string | null }[]>("/categories"),
  create: (data: Record<string, unknown>) => apiClient.post("/categories", data), update: (id: string, data: Record<string, unknown>) => apiClient.patch(`/categories/${id}`, data), delete: (id: string) => apiClient.delete(`/categories/${id}`),
};
export const suppliersAPI = {
  getAll: () => apiClient.get<{ id: string; name: string; company: string | null; email: string; phone: string | null; address: string | null }[]>("/suppliers"),
  create: (data: Record<string, unknown>) => apiClient.post("/suppliers", data), update: (id: string, data: Record<string, unknown>) => apiClient.patch(`/suppliers/${id}`, data), delete: (id: string) => apiClient.delete(`/suppliers/${id}`),
};
export interface StoreInfo { id:string;name:string;address:string;phone:string;email?:string|null;website?:string|null;taxCode?:string|null;logoUrl?:string|null;facebookUrl?:string|null;businessHours?:string|null;notes?:string|null;isActive:boolean;createdAt:string;updatedAt:string; }
export type PublicStoreInfo = Omit<StoreInfo, 'taxCode' | 'isActive'>;
export type StoreInfoInput = Omit<StoreInfo,'id'|'createdAt'|'updatedAt'>;
export const storeInfoAPI = {
  getPublic:()=>apiClient.get<PublicStoreInfo | null>('/store-info/public'),
  getAll:()=>apiClient.get<StoreInfo[]>('/store-info'),
  getOne:(id:string)=>apiClient.get<StoreInfo>(`/store-info/${id}`),
  create:(data:StoreInfoInput)=>apiClient.post<StoreInfo>('/store-info',data),
  update:(id:string,data:Partial<StoreInfoInput>)=>apiClient.patch<StoreInfo>(`/store-info/${id}`,data),
  delete:(id:string)=>apiClient.delete(`/store-info/${id}`),
};
export interface AboutPage { id:string;title:string;summary:string;content:string;imageUrl?:string|null;isPublished:boolean;createdAt:string;updatedAt:string; }
export type AboutPageInput = Omit<AboutPage, 'id' | 'createdAt' | 'updatedAt'>;
export const aboutAPI = {
  getPublic: () => apiClient.get<AboutPage | null>('/about/public'),
  getAll: () => apiClient.get<AboutPage[]>('/about'),
  create: (data: AboutPageInput) => apiClient.post<AboutPage>('/about', data),
  update: (id: string, data: Partial<AboutPageInput>) => apiClient.patch<AboutPage>(`/about/${id}`, data),
  delete: (id: string) => apiClient.delete(`/about/${id}`),
};
export const wheelRimsAPI = {
  create: (data: Record<string, unknown>) => apiClient.post("/wheel-rims", data), update: (id: string, data: Record<string, unknown>) => apiClient.patch(`/wheel-rims/${id}`, data), delete: (id: string) => apiClient.delete(`/wheel-rims/${id}`),
};
