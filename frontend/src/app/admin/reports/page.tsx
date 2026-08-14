"use client";

import { Alert, Box, Card, CardContent, CircularProgress, Grid, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { adminManagementAPI } from "@/lib/api-client";

export default function ReportsPage() { const [data, setData] = useState<Awaited<ReturnType<typeof adminManagementAPI.reports>>["data"]>(); const [error, setError] = useState(false); useEffect(() => { adminManagementAPI.reports().then((response) => setData(response.data)).catch(() => setError(true)); }, []); if (error) return <Alert severity="error">Không thể tải báo cáo.</Alert>; if (!data) return <CircularProgress />; return <Box><AdminPageHeader title="Báo cáo & thống kê" description="Chỉ tính đơn hàng đã thanh toán" /><Grid container spacing={2}><Grid item xs={12} sm={6} md={3}><StatCard label="Doanh thu" value={`${data.revenue.toLocaleString("vi-VN")} ₫`} icon="₫" /></Grid><Grid item xs={12} sm={6} md={3}><StatCard label="Đơn đã thanh toán" value={data.paidOrders} icon="✓" /></Grid><Grid item xs={12} sm={6} md={3}><StatCard label="Giá trị đơn TB" value={`${data.averageOrderValue.toLocaleString("vi-VN")} ₫`} icon="₫" /></Grid><Grid item xs={12} sm={6} md={3}><StatCard label="Giá trị tồn kho" value={`${data.inventoryCost.toLocaleString("vi-VN")} ₫`} icon="₫" /></Grid><Grid item xs={12}><Card><CardContent><Typography variant="h6" gutterBottom>Khách hàng doanh thu cao</Typography>{data.topClients.map((client) => <Typography key={client.id}>{client.name} — {client.orders} đơn — {client.revenue.toLocaleString("vi-VN")} ₫</Typography>)}</CardContent></Card></Grid></Grid></Box>; }
