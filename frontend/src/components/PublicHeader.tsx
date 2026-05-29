"use client";

import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Link as MuiLink,
  Badge,
  IconButton,
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
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <MuiLink
              component={NextLink}
              href="/"
              sx={{
                color: "white",
                textDecoration: "none",
                fontSize: "1.5rem",
                fontWeight: "bold",
              }}
            >
              Võ Mâm Xe Nâng
            </MuiLink>
          </Box>

          <Button color="inherit" component={NextLink} href="/">
            Trang chủ
          </Button>
          <Button color="inherit" component={NextLink} href="/blog">
            Blog
          </Button>
          <Button color="inherit" component={NextLink} href="/products">
            Sản phẩm
          </Button>

          <IconButton
            color="inherit"
            onClick={() => setCartOpen(true)}
            sx={{ marginRight: "1rem" }}
          >
            <Badge badgeContent={items.length} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {isAuthenticated ? (
            <>
              <Button color="inherit" component={NextLink} href="/admin">
                Admin ({user?.email})
              </Button>
              <Button color="inherit" onClick={logout}>
                Đăng xuất
              </Button>
            </>
          ) : (
            <Button color="inherit" component={NextLink} href="/admin/login">
              Đăng nhập
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
