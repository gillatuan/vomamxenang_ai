"use client";

import { Box, Card, CardContent, Grid, Typography, CircularProgress, Alert } from "@mui/material";
import { useEffect, useState } from "react";
import { clientsAPI, productsAPI, ordersAPI } from "@/lib/api-client";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ clients: 0, products: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      clientsAPI.getAll(),
      productsAPI.getAll(),
      ordersAPI.getAll(),
    ])
      .then(([clientsRes, productsRes, ordersRes]) => {
        setStats({
          clients: clientsRes.data.length,
          products: productsRes.data.length,
          orders: ordersRes.data.length,
        });
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load dashboard stats");
        setLoading(false);
      });
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Khách hàng</Typography>
            <Typography variant="h5">{stats.clients}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Sản phẩm</Typography>
            <Typography variant="h5">{stats.products}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Typography color="textSecondary">Đơn hàng</Typography>
            <Typography variant="h5">{stats.orders}</Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
