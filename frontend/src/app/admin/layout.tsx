"use client";

import { useEffect, useState } from "react";
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
  CircularProgress,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import theme from '@/theme';
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isLoginRoute = pathname === "/admin/login";

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated && !isLoginRoute) {
      router.push("/admin/login");
      return;
    }

    if (isAuthenticated && isLoginRoute) {
      router.push("/admin");
    }
  }, [isAuthenticated, isInitialized, isLoginRoute, router]);

  if (!isInitialized) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated && isLoginRoute) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Box sx={{ display: "flex" }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && <IconButton color="inherit" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}><MenuIcon /></IconButton>}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Quản lý Võ Mâm Xe Nâng
          </Typography>
          <Typography variant="body2" sx={{ mr: 2, display: { xs: "none", sm: "block" } }}>{user?.email} · {user?.role}</Typography>
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
          <AdminSidebar />
        </Drawer>
      )}

      <Box sx={{ flexGrow: 1, marginTop: "64px", padding: "2rem", minHeight: "calc(100vh - 64px)" }}>
        {!isLoginRoute && <AdminBreadcrumbs />}
        {children}
      </Box>

      {isMobile && (
        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} variant="temporary" sx={{ "& .MuiDrawer-paper": { width: 300 } }}><Toolbar /><AdminSidebar /></Drawer>
      )}
    </Box>
  );
}
