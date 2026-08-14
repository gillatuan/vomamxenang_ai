export type StockStatus = "OUT_OF_STOCK" | "LOW_STOCK" | "NORMAL" | "OVERSTOCK";

export interface DashboardSummary {
  inventory: { products: number; tires: number; wheelRims: number; quantity: number; lowStock: number; outOfStock: number; overstock: number };
  warehouse: { warehouses: number; locations: number; totalCapacity: number; usedCapacity: number; utilizationRate: number };
  content: { posts: number; productComments: number; postComments: number; favourites: number };
  business?: { clients: number; suppliers: number; orders: number; pendingOrders: number; paidOrders: number; todayRevenue: number; monthlyRevenue: number };
}

export interface InventoryAlert { productId: string; sku: string; name: string; type: string; brand: string | null; size: string | null; currentQuantity: number; minStock: number; maxStock: number; status: StockStatus; }
export interface InventoryMovement { date: string; imports: number; exports: number; assemblyOut: number; assemblyIn: number; }
export interface OrderStatusData { status: string; count: number; percentage: number; }
