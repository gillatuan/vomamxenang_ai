"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  Button,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from "@mui/material";
import Link from "next/link";
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import LayersIcon from '@mui/icons-material/Layers';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AssignmentIcon from '@mui/icons-material/Assignment';
import theme from '@/theme';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, logout, isAdminManager } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const isLoginRoute = pathname === "/admin/login";

  useEffect(() => {
    if (!isAuthenticated && !isLoginRoute) {
      router.push("/admin/login");
    }
    if (isAuthenticated && isLoginRoute) {
      router.push("/admin");
    }
  }, [isAuthenticated, isLoginRoute, router]);

  if (!isAuthenticated && isLoginRoute) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: <DashboardIcon /> },
    { label: "Kho", href: "/admin/warehouse", icon: <InventoryIcon /> },
    { label: "Nhập/Xuất", href: "/admin/import-export", icon: <ShoppingCartIcon /> },
  ];

  if (isAdminManager) {
    navItems.push({ label: "Sản phẩm", href: "/admin/products", icon: <LayersIcon /> });
    navItems.push({ label: "Báo cáo", href: "/admin/clients", icon: <AssignmentIcon /> });
  }

  const bottomNavValue = navItems.findIndex((item) => pathname === item.href);

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Quản lý Võ Mâm Xe Nâng
          </Typography>
          <Button color="inherit" onClick={logout}>
            Đăng xuất
          </Button>
        </Toolbar>
      </AppBar>

      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: 260,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: 260,
              boxSizing: "border-box",
              marginTop: "64px",
            },
          }}
        >
          <Box sx={{ padding: "1rem" }}>
            {navItems.map((item) => (
              <Button
                key={item.href}
                fullWidth
                component={Link}
                href={item.href}
                variant={pathname === item.href ? "contained" : "text"}
                sx={{ marginBottom: "0.5rem", justifyContent: "flex-start" }}
                startIcon={item.icon}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1, marginTop: "64px", padding: "2rem", minHeight: "calc(100vh - 64px)" }}>
        {children}
      </Box>

      {isMobile && (
        <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation value={bottomNavValue} showLabels>
            {navItems.map((item) => (
              <BottomNavigationAction
                key={item.href}
                label={item.label}
                icon={item.icon}
                component={Link}
                href={item.href}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
}
