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
  Drawer,
  Divider,
  Typography,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth";
import { useCartStore } from "@/store/cart";
import { useState } from "react";
import { CartDrawer } from "./CartDrawer";

const navigation = [
  { label: "Trang chủ", href: "/" },
  { label: "Giới thiệu", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Sản phẩm", href: "/products" },
];

export function PublicHeader() {
  const { isAuthenticated, logout, user } = useAuth();
  const items = useCartStore((state) => state.items);
  const pathname = usePathname();
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      <AppBar position="sticky">
        <Toolbar
          sx={{
            minHeight: { xs: 64, md: 78 },
            gap: { xs: 1, md: 1 },
            px: { xs: 2, md: 5 },
            maxWidth: 1600,
            width: "100%",
            mx: "auto",
          }}
        >
          <MuiLink
            component={NextLink}
            href="/"
            aria-label="Võ Mâm Xe Nâng - Trang chủ"
            sx={{
              mr: "auto",
              color: "text.primary",
              textDecoration: "none",
              fontSize: { xs: "1rem", sm: "1.08rem", md: "1.25rem" },
              fontWeight: 800,
              letterSpacing: { xs: "0.06em", md: "0.08em" },
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            Võ Mâm Xe Nâng
          </MuiLink>

          <Box component="nav" aria-label="Điều hướng chính" sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 0.25 }}>
            {navigation.map((item) => (
              <Button key={item.href} variant="text" color="inherit" component={NextLink} href={item.href} sx={navLinkSx}>
                {item.label}
              </Button>
            ))}
          </Box>

          <Tooltip title="Giỏ hàng">
            <IconButton
              color="inherit"
              aria-label="Mở giỏ hàng"
              onClick={() => setCartOpen(true)}
              sx={{ ml: { md: 1 }, p: 1 }}
            >
              <Badge badgeContent={items.length} color="secondary"><ShoppingCartIcon /></Badge>
            </IconButton>
          </Tooltip>

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
            {isAuthenticated ? (
              <>
                <Button variant="text" color="inherit" component={NextLink} href="/admin" sx={navLinkSx}>
                  Admin ({user?.email})
                </Button>
                <Button variant="outlined" color="inherit" onClick={logout} sx={accountButtonSx}>Đăng xuất</Button>
              </>
            ) : (
              <Button variant="outlined" color="inherit" component={NextLink} href="/admin/login" sx={accountButtonSx}>Đăng nhập</Button>
            )}
          </Box>

          <IconButton
            aria-label="Mở menu"
            aria-controls={menuOpen ? "mobile-navigation" : undefined}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            sx={{
              display: { xs: "inline-flex", md: "none" },
              width: 42,
              height: 42,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        id="mobile-navigation"
        anchor="right"
        open={menuOpen}
        onClose={closeMenu}
        PaperProps={{
          sx: {
            width: "min(88vw, 380px)",
            bgcolor: "background.default",
            borderLeft: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <Box sx={{ minHeight: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ minHeight: 64, px: 2.5, display: "flex", alignItems: "center", borderBottom: "1px solid", borderColor: "divider" }}>
            <Box>
              <Typography sx={{ fontSize: "0.66rem", color: "secondary.main", fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                Menu
              </Typography>
              <Typography sx={{ mt: 0.25, fontSize: "0.88rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                Võ Mâm Xe Nâng
              </Typography>
            </Box>
            <IconButton aria-label="Đóng menu" onClick={closeMenu} sx={{ ml: "auto", width: 42, height: 42 }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box component="nav" aria-label="Điều hướng mobile" sx={{ px: 2.5, py: 2 }}>
            {navigation.map((item, index) => {
              const active = isActive(item.href);
              return (
                <MuiLink
                  key={item.href}
                  component={NextLink}
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={active ? "page" : undefined}
                  sx={{
                    minHeight: 58,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    color: active ? "secondary.main" : "text.primary",
                    textDecoration: "none",
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    fontSize: "1rem",
                    fontWeight: active ? 800 : 700,
                    letterSpacing: "0.025em",
                    "&:hover": { color: "secondary.main" },
                  }}
                >
                  <Typography component="span" sx={{ width: 24, fontSize: "0.64rem", color: active ? "secondary.main" : "text.secondary", letterSpacing: "0.08em" }}>
                    {String(index + 1).padStart(2, "0")}
                  </Typography>
                  <Box component="span" sx={{ flex: 1 }}>{item.label}</Box>
                  <ArrowForwardIcon sx={{ fontSize: 18, opacity: active ? 1 : 0.45 }} />
                </MuiLink>
              );
            })}
          </Box>

          <Box sx={{ mt: "auto", px: 2.5, pb: 3 }}>
            <Divider sx={{ mb: 2.5 }} />
            {isAuthenticated ? (
              <>
                <Button fullWidth variant="outlined" component={NextLink} href="/admin" onClick={closeMenu} sx={mobileAccountSx}>
                  Quản trị · {user?.email}
                </Button>
                <Button fullWidth onClick={() => { closeMenu(); logout(); }} sx={{ ...mobileAccountSx, mt: 1, bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.main" } }}>
                  Đăng xuất
                </Button>
              </>
            ) : (
              <Button fullWidth component={NextLink} href="/admin/login" onClick={closeMenu} sx={{ ...mobileAccountSx, bgcolor: "primary.main", color: "primary.contrastText", "&:hover": { bgcolor: "primary.main" } }}>
                Đăng nhập
              </Button>
            )}
            <Typography sx={{ mt: 2, color: "text.secondary", fontSize: "0.7rem", lineHeight: 1.6 }}>
              Vỏ xe nâng · Mâm xe nâng · Dịch vụ chuyên nghiệp
            </Typography>
          </Box>
        </Box>
      </Drawer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

const navLinkSx = {
  minWidth: "auto",
  px: { md: 1.35 },
  py: 0.9,
  color: "#1a1a1a",
  fontSize: "1.1rem",
  letterSpacing: "0.1em",
  fontWeight: 800,
  whiteSpace: "nowrap",
  "&:hover": { backgroundColor: "transparent", color: "secondary.main", textDecoration: "underline", textUnderlineOffset: "5px" },
};

const accountButtonSx = {
  ml: 0.75,
  px: 1.5,
  py: 0.7,
  borderColor: "#1a1a1a",
  color: "#1a1a1a",
  borderRadius: 0,
  fontWeight: 700,
  fontSize: "0.74rem",
  letterSpacing: "0.08em",
  whiteSpace: "nowrap",
  "&:hover": { borderColor: "#1a1a1a", backgroundColor: "#1a1a1a", color: "#fff" },
};

const mobileAccountSx = {
  minHeight: 48,
  borderRadius: 0,
  fontSize: "0.72rem",
  fontWeight: 800,
  letterSpacing: "0.08em",
};
