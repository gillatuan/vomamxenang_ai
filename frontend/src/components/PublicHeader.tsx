"use client";

import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Link as MuiLink,
  Badge,
  IconButton,
  Tooltip,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import NextLink from "next/link";
import { useAuth } from "@/context/auth";
import { useCartStore } from "@/store/cart";
import { useState } from "react";
import { CartDrawer } from "./CartDrawer";

export function PublicHeader() {
  const { isAuthenticated, logout, user } = useAuth();
  const items = useCartStore((state) => state.items);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <AppBar position="sticky">
        <Toolbar sx={{ minHeight: { xs: 62, md: 78 }, gap: { xs: 0, md: 1 }, px: { xs: 1.5, md: 5 }, maxWidth: 1600, width: "100%", mx: "auto" }}>
          <Box sx={{ mr: "auto", display: { xs: "none", sm: "block" }, whiteSpace: "nowrap" }}>
            <MuiLink
              component={NextLink}
              href="/"
              sx={{
                color: "#1a1a1a",
                textDecoration: "none",
                fontSize: { sm: "1rem", md: "1.15rem" },
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Võ Mâm Xe Nâng
            </MuiLink>
          </Box>

          <Box component="nav" aria-label="Điều hướng chính" sx={{ display: "flex", alignItems: "center", gap: { xs: 0, md: 0.25 }, overflowX: "auto" }}>
            <Button variant="text" color="inherit" component={NextLink} href="/" sx={navLinkSx}>Trang chủ</Button>
            <Button variant="text" color="inherit" component={NextLink} href="/about" sx={navLinkSx}>Giới thiệu</Button>
            <Button variant="text" color="inherit" component={NextLink} href="/blog" sx={navLinkSx}>Blog</Button>
            <Button variant="text" color="inherit" component={NextLink} href="/products" sx={navLinkSx}>Sản phẩm</Button>
          </Box>

          <Tooltip title="Giỏ hàng"><IconButton color="inherit" aria-label="Mở giỏ hàng" onClick={() => setCartOpen(true)} sx={{ ml: { xs: 0.25, md: 1 }, p: 1 }}><Badge badgeContent={items.length} color="secondary"><ShoppingCartIcon /></Badge></IconButton></Tooltip>

          {isAuthenticated ? (
            <>
              <Button variant="text" color="inherit" component={NextLink} href="/admin" sx={navLinkSx}>
                Admin ({user?.email})
              </Button>
              <Button variant="outlined" color="inherit" onClick={logout} sx={accountButtonSx}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button variant="outlined" color="inherit" component={NextLink} href="/admin/login" sx={accountButtonSx}>
              Đăng nhập
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

const navLinkSx = {
  minWidth: "auto",
  px: { xs: 0.65, sm: 1, md: 1.35 },
  py: 0.9,
  color: "#1a1a1a",
  fontSize: { xs: "0.67rem", md: "0.72rem" },
  letterSpacing: "0.1em",
  fontWeight: 800,
  whiteSpace: "nowrap",
  "&:hover": { backgroundColor: "transparent", color: "secondary.main", textDecoration: "underline", textUnderlineOffset: "5px" },
};

const accountButtonSx = {
  ml: { xs: 0.25, md: 0.75 },
  px: { xs: 1, md: 1.5 },
  py: 0.7,
  borderColor: "#1a1a1a",
  color: "#1a1a1a",
  borderRadius: 0,
  fontWeight: 700,
  fontSize: "0.67rem",
  letterSpacing: "0.08em",
  whiteSpace: "nowrap",
  "&:hover": { borderColor: "#1a1a1a", backgroundColor: "#1a1a1a", color: "#fff" },
};
