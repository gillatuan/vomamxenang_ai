"use client";

import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Link as MuiLink,
} from "@mui/material";
import NextLink from "next/link";
import { useAuth } from "@/context/auth";

export function Header() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <AppBar position="sticky">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <MuiLink
            component={NextLink}
            href="/"
            sx={{ color: "white", textDecoration: "none", fontSize: "1.5rem", fontWeight: "bold" }}
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
  );
}
