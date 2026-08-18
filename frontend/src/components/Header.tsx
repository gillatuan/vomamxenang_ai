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
      <Toolbar sx={{ minHeight: 68, gap: { xs: 0.25, md: 0.75 }, px: { xs: 1.5, md: 3 } }}>
        <Box sx={{ mr: "auto", display: { xs: "none", sm: "block" }, whiteSpace: "nowrap" }}>
          <MuiLink
            component={NextLink}
            href="/"
            sx={{ color: "white", textDecoration: "none", fontSize: "1.5rem", fontWeight: "bold" }}
          >
            Võ Mâm Xe Nâng
          </MuiLink>
        </Box>

        <Box component="nav" aria-label="Điều hướng chính" sx={{ display: "flex", alignItems: "center", gap: { xs: 0, md: 0.25 } }}>
          <Button variant="text" color="inherit" component={NextLink} href="/" sx={navLinkSx}>Trang chủ</Button>
          <Button variant="text" color="inherit" component={NextLink} href="/about" sx={navLinkSx}>Giới thiệu</Button>
          <Button variant="text" color="inherit" component={NextLink} href="/blog" sx={navLinkSx}>Blog</Button>
          <Button variant="text" color="inherit" component={NextLink} href="/products" sx={navLinkSx}>Sản phẩm</Button>
        </Box>

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
          <Button variant="outlined" color="inherit" component={NextLink} href="/auth/login" sx={accountButtonSx}>
            Đăng nhập
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

const navLinkSx = {
  minWidth: "auto",
  px: { xs: 0.75, sm: 1.25, md: 1.5 },
  py: 0.9,
  borderRadius: 1.5,
  fontWeight: 600,
  whiteSpace: "nowrap",
  "&:hover": { backgroundColor: "rgba(255,255,255,0.14)" },
};

const accountButtonSx = {
  ml: { xs: 0.25, md: 0.75 },
  px: { xs: 1, md: 1.5 },
  py: 0.7,
  borderColor: "rgba(255,255,255,0.72)",
  fontWeight: 700,
  whiteSpace: "nowrap",
  "&:hover": { borderColor: "#fff", backgroundColor: "rgba(255,255,255,0.14)" },
};
