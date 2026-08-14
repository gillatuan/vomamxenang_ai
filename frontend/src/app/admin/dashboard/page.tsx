"use client";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import { Alert, Box, Card, CardContent, CircularProgress, Grid, MenuItem, Select, Typography } from "@mui/material";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { adminDashboardAPI } from "@/lib/api-client";
import type { DashboardSummary, InventoryAlert, InventoryMovement } from "@/types/admin";
import { useAuth } from "@/context/auth";

export default function DashboardPage() {
  const { isAdminManager } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary>(); const [alerts, setAlerts] = useState<InventoryAlert[]>([]); const [movement, setMovement] = useState<InventoryMovement[]>([]); const [range, setRange] = useState<"7d" | "30d" | "3m" | "6m" | "12m">("30d"); const [error, setError] = useState(false);
  useEffect(() => { Promise.all([adminDashboardAPI.summary(), adminDashboardAPI.lowStock(), adminDashboardAPI.inventoryMovement(range)]).then(([summaryResponse, alertResponse, movementResponse]) => { setSummary(summaryResponse.data); setAlerts(alertResponse.data); setMovement(movementResponse.data); }).catch(() => setError(true)); }, [range]);
  if (error) return <Alert severity="error">Không thể tải dữ liệu dashboard. Vui lòng thử lại.</Alert>;
  if (!summary) return <CircularProgress />;
  return <Box><AdminPageHeader title="Dashboard" description="Tổng quan vận hành kho, bán hàng và cảnh báo tồn kho" actions={<Select size="small" value={range} onChange={(event) => setRange(event.target.value as typeof range)}>{[["7d","7 ngày"],["30d","30 ngày"],["3m","3 tháng"],["6m","6 tháng"],["12m","12 tháng"]].map(([value,label]) => <MenuItem value={value} key={value}>{label}</MenuItem>)}</Select>} /><Grid container spacing={2}><Grid item xs={12} sm={6} md={3}><StatCard label="Tổng tồn kho" value={summary.inventory.quantity} icon={<Inventory2Icon />} href="/admin/inventory/stock" /></Grid><Grid item xs={12} sm={6} md={3}><StatCard label="Sắp hết hàng" value={summary.inventory.lowStock} icon={<WarningAmberIcon />} href="/admin/inventory/stock?status=low-stock" /></Grid><Grid item xs={12} sm={6} md={3}><StatCard label="Hết hàng" value={summary.inventory.outOfStock} icon={<WarningAmberIcon color="error" />} href="/admin/inventory/stock?status=out-of-stock" /></Grid><Grid item xs={12} sm={6} md={3}><StatCard label="Sức chứa kho" value={`${summary.warehouse.utilizationRate}%`} icon={<WarehouseIcon />} href="/admin/inventory/warehouses" /></Grid>{isAdminManager && summary.business && <><Grid item xs={12} sm={6} md={3}><StatCard label="Đơn chờ xử lý" value={summary.business.pendingOrders} icon={<Inventory2Icon />} href="/admin/sales/orders" /></Grid><Grid item xs={12} sm={6} md={3}><StatCard label="Doanh thu tháng" value={`${summary.business.monthlyRevenue.toLocaleString("vi-VN")} ₫`} icon={<Inventory2Icon />} /></Grid></>}<Grid item xs={12} md={8}><Card><CardContent><Typography variant="h6" gutterBottom>Biến động kho</Typography><ResponsiveContainer width="100%" height={300}><BarChart data={movement}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip /><Legend /><Bar dataKey="imports" name="Nhập" fill="#f57c00" /><Bar dataKey="exports" name="Xuất" fill="#263238" /><Bar dataKey="assemblyOut" name="Ép mâm ra" fill="#d84315" /></BarChart></ResponsiveContainer></CardContent></Card></Grid><Grid item xs={12} md={4}><Card><CardContent><Typography variant="h6" gutterBottom>Cảnh báo tồn kho</Typography>{alerts.filter((item) => item.status !== "NORMAL").slice(0, 6).map((item) => <Alert key={item.productId} severity={item.status === "OUT_OF_STOCK" ? "error" : "warning"} sx={{ mb: 1 }}>{item.sku} — {item.currentQuantity}/{item.minStock}</Alert>) || <Typography color="text.secondary">Không có cảnh báo.</Typography>}</CardContent></Card></Grid></Grid></Box>;
}
