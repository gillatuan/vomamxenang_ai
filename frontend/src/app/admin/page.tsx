"use client";

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Button,
  AlertTitle,
  Paper,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { clientsAPI, productsAPI, ordersAPI } from "@/lib/api-client";
import { useAuth } from "@/context/auth";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";

export default function AdminDashboard() {
  const { isAdminManager } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([productsAPI.getAll(), ordersAPI.getAll(), clientsAPI.getAll()])
      .then(([productsRes, ordersRes]) => {
        setProducts(productsRes.data);
        setOrders(ordersRes.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Không thể tải dữ liệu dashboard.");
        setLoading(false);
      });
  }, []);

  const lowStockItems = useMemo(
    () => products.filter((item) => item.quantityInStock <= (item.minStock ?? 10)),
    [products]
  );

  const totalTyres = useMemo(
    () => products.filter((item) => item.type === "TIRE").reduce((sum, item) => sum + item.quantityInStock, 0),
    [products]
  );

  const totalRims = useMemo(
    () => products.filter((item) => item.type === "RIM").reduce((sum, item) => sum + item.quantityInStock, 0),
    [products]
  );

  const orderCount = useMemo(
    () => orders.filter((order) => order.status === "PAID").length,
    [orders]
  );

  const brandDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((item) => {
      const brand = item.name?.split(" ")[0] || "Khác";
      counts[brand] = (counts[brand] ?? 0) + (item.quantityInStock || 0);
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [products]);

  const inventoryTrend = useMemo(
    () => [
      { name: "Thứ 2", receipts: 8, exports: 6 },
      { name: "Thứ 3", receipts: 12, exports: 9 },
      { name: "Thứ 4", receipts: 7, exports: 11 },
      { name: "Thứ 5", receipts: 14, exports: 10 },
      { name: "Thứ 6", receipts: 18, exports: 15 },
      { name: "Thứ 7", receipts: 10, exports: 8 },
      { name: "CN", receipts: 6, exports: 5 },
    ],
    []
  );

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <TrendingUpIcon color="primary" />
              <Typography variant="subtitle2">Tổng số lượng vỏ xe</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {totalTyres}
            </Typography>
            <Typography color="textSecondary">Units</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Inventory2Icon color="secondary" />
              <Typography variant="subtitle2">Số lượng mâm</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {totalRims}
            </Typography>
            <Typography color="textSecondary">Units</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <WarningAmberIcon color="warning" />
              <Typography variant="subtitle2">Đang dưới định mức</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {lowStockItems.length}
            </Typography>
            <Typography color="textSecondary">Mã sản phẩm</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <ReceiptLongIcon color="success" />
              <Typography variant="subtitle2">Đơn nhập/xuất hoàn thành</Typography>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {orderCount}
            </Typography>
            <Typography color="textSecondary">Trong ngày</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Trung tâm cảnh báo tồn kho
            </Typography>
            {lowStockItems.length === 0 ? (
              <Alert severity="success">Không có mã nào dưới định mức.</Alert>
            ) : (
              lowStockItems.slice(0, 4).map((item) => (
                <Alert
                  severity="warning"
                  key={item.id}
                  sx={{ mb: 1 }}
                  action={
                    <Button size="small" variant="contained" color="warning" href="/admin/import-export">
                      Mua bổ sung
                    </Button>
                  }
                >
                  <AlertTitle>{item.name}</AlertTitle>
                  Còn {item.quantityInStock} đơn vị — <strong>định mức tối thiểu {item.minStock ?? 10}</strong>
                </Alert>
              ))
            )}
          </CardContent>
        </Card>
      </Grid>

      {isAdminManager && (
        <>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Xu hướng Nhập/Xuất
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={inventoryTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="receipts" fill="#F57C00" />
                  <Bar dataKey="exports" fill="#424242" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Cơ cấu thương hiệu
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={brandDistribution} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} label>
                    {brandDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#F57C00" : "#263238"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </>
      )}
    </Grid>
  );
}
