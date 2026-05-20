"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import { Box, Drawer, AppBar, Toolbar, Typography, Button, Container } from "@mui/material";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/admin/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Button color="inherit" onClick={logout}>
            Đăng xuất
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: 250,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 250,
            boxSizing: "border-box",
            marginTop: "64px",
          },
        }}
      >
        <Box sx={{ padding: "1rem" }}>
          <Button
            fullWidth
            component={Link}
            href="/admin"
            variant="text"
            sx={{ marginBottom: "0.5rem", justifyContent: "flex-start" }}
          >
            Dashboard
          </Button>
          <Button
            fullWidth
            component={Link}
            href="/admin/clients"
            variant="text"
            sx={{ marginBottom: "0.5rem", justifyContent: "flex-start" }}
          >
            Khách hàng
          </Button>
          <Button
            fullWidth
            component={Link}
            href="/admin/products"
            variant="text"
            sx={{ marginBottom: "0.5rem", justifyContent: "flex-start" }}
          >
            Sản phẩm
          </Button>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1, marginTop: "64px", padding: "2rem" }}>
        {children}
      </Box>
    </Box>
  );
}
