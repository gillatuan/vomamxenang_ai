"use client";

import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ArticleIcon from "@mui/icons-material/Article";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CategoryIcon from "@mui/icons-material/Category";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import GroupIcon from "@mui/icons-material/Group";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PersonIcon from "@mui/icons-material/Person";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SettingsIcon from "@mui/icons-material/Settings";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StorefrontIcon from "@mui/icons-material/Storefront";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { useAuth } from "@/context/auth";

type Item = { label: string; href: string; icon: ReactNode; adminOnly?: boolean };
type Group = { label: string; icon: ReactNode; items: Item[] };
const groups: Group[] = [
  { label: "TỔNG QUAN", icon: <DashboardIcon />, items: [{ label: "Dashboard", href: "/admin/dashboard", icon: <DashboardIcon /> }] },
  { label: "QUẢN LÝ KHO", icon: <WarehouseIcon />, items: [{ label: "Sản phẩm", href: "/admin/inventory/products", icon: <InventoryIcon /> }, { label: "Danh mục sản phẩm", href: "/admin/inventory/categories", icon: <CategoryIcon /> }, { label: "Mâm xe", href: "/admin/inventory/wheel-rims", icon: <SettingsIcon /> }, { label: "Kho hàng", href: "/admin/inventory/warehouses", icon: <WarehouseIcon /> }, { label: "Tồn kho", href: "/admin/inventory/stock", icon: <InventoryIcon /> }, { label: "Nhập / Xuất", href: "/admin/inventory/transactions", icon: <ReceiptLongIcon /> }, { label: "Ép mâm", href: "/admin/inventory/assembly", icon: <AccountTreeIcon /> }] },
  { label: "KINH DOANH", icon: <ReceiptLongIcon />, items: [{ label: "Đơn hàng", href: "/admin/sales/orders", icon: <ReceiptLongIcon />, adminOnly: true }, { label: "Khách hàng", href: "/admin/sales/clients", icon: <GroupIcon />, adminOnly: true }, { label: "Bảng giá B2B", href: "/admin/sales/price-matrix", icon: <LocalShippingIcon />, adminOnly: true }] },
  { label: "NHÀ CUNG CẤP", icon: <LocalShippingIcon />, items: [{ label: "Nhà cung cấp", href: "/admin/suppliers", icon: <LocalShippingIcon />, adminOnly: true }] },
  { label: "NỘI DUNG", icon: <ArticleIcon />, items: [{ label: "Giới thiệu", href: "/admin/content/about", icon: <ArticleIcon />, adminOnly: true }, { label: "Bài viết", href: "/admin/content/posts", icon: <ArticleIcon />, adminOnly: true }, { label: "Bình luận sản phẩm", href: "/admin/content/product-comments", icon: <ArticleIcon />, adminOnly: true }, { label: "Bình luận bài viết", href: "/admin/content/post-comments", icon: <ArticleIcon />, adminOnly: true }, { label: "Sản phẩm yêu thích", href: "/admin/content/favourites", icon: <AssessmentIcon />, adminOnly: true }] },
  { label: "SEO", icon: <AssessmentIcon />, items: [{ label: "Tổng quan SEO", href: "/admin/seo", icon: <AssessmentIcon />, adminOnly: true }, { label: "Product SEO", href: "/admin/seo/products", icon: <InventoryIcon />, adminOnly: true }, { label: "Post SEO", href: "/admin/seo/posts", icon: <ArticleIcon />, adminOnly: true }, { label: "Keywords", href: "/admin/seo/keywords", icon: <AssessmentIcon />, adminOnly: true }, { label: "Internal Links", href: "/admin/seo/internal-links", icon: <AccountTreeIcon />, adminOnly: true }, { label: "Backlink Opportunities", href: "/admin/seo/backlinks", icon: <AccountTreeIcon />, adminOnly: true }, { label: "Campaigns", href: "/admin/seo/campaigns", icon: <ArticleIcon />, adminOnly: true }] },
  { label: "AI STUDIO", icon: <AutoAwesomeIcon />, items: [{ label: "Tổng quan", href: "/admin/ai", icon: <AutoAwesomeIcon />, adminOnly: true }, { label: "Daily SEO Content", href: "/admin/ai/daily", icon: <AutoAwesomeIcon />, adminOnly: true }, { label: "Tạo sản phẩm", href: "/admin/ai/product", icon: <InventoryIcon />, adminOnly: true }, { label: "Tạo bài viết", href: "/admin/ai/blog", icon: <ArticleIcon />, adminOnly: true }, { label: "Tạo SEO", href: "/admin/ai/seo", icon: <AssessmentIcon />, adminOnly: true }] },
  { label: "HỆ THỐNG", icon: <PersonIcon />, items: [{ label: "Người dùng", href: "/admin/users", icon: <PersonIcon />, adminOnly: true }, { label: "Thông tin cửa hàng", href: "/admin/store-info", icon: <StorefrontIcon />, adminOnly: true }, { label: "Xóa cache website", href: "/admin/cache", icon: <DeleteSweepIcon />, adminOnly: true }] },
  { label: "PHÂN TÍCH", icon: <AssessmentIcon />, items: [{ label: "Báo cáo & thống kê", href: "/admin/reports", icon: <AssessmentIcon />, adminOnly: true }] },
];

export function AdminSidebar() {
  const pathname = usePathname(); const { isAdminManager } = useAuth();
  const [open, setOpen] = useState<Record<string, boolean>>({ "TỔNG QUAN": true, "QUẢN LÝ KHO": true, "KINH DOANH": true });
  return <List disablePadding>{groups.map((group) => {
    const items = group.items.filter((item) => !item.adminOnly || isAdminManager); if (!items.length) return null;
    const isOpen = open[group.label] ?? false;
    return <div key={group.label}><ListItemButton onClick={() => setOpen((value) => ({ ...value, [group.label]: !isOpen }))}><ListItemIcon>{group.icon}</ListItemIcon><ListItemText primary={<Typography variant="caption" fontWeight={800}>{group.label}</Typography>} />{isOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}</ListItemButton><Collapse in={isOpen} timeout="auto" unmountOnExit><List disablePadding>{items.map((item) => <ListItemButton key={item.href} component={NextLink} href={item.href} selected={pathname === item.href} sx={{ pl: 4 }}><ListItemIcon>{item.icon}</ListItemIcon><ListItemText primary={item.label} /></ListItemButton>)}</List></Collapse></div>;
  })}</List>;
}
