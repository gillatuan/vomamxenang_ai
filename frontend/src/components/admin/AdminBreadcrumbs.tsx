"use client";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = { admin: "Dashboard", dashboard: "Dashboard", inventory: "Quản lý kho", products: "Sản phẩm", "wheel-rims": "Mâm xe", categories: "Danh mục", warehouses: "Kho hàng", stock: "Tồn kho", transactions: "Nhập / Xuất", assembly: "Ép mâm", sales: "Kinh doanh", orders: "Đơn hàng", clients: "Khách hàng", "price-matrix": "Bảng giá B2B", suppliers: "Nhà cung cấp", content: "Nội dung", posts: "Bài viết", "product-comments": "Bình luận sản phẩm", "post-comments": "Bình luận bài viết", favourites: "Sản phẩm yêu thích", users: "Người dùng", reports: "Báo cáo & thống kê" };

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  return <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
    {segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const label = labels[segment] ?? segment;
      return index === segments.length - 1 ? <Typography key={href} color="text.primary">{label}</Typography> : <Link key={href} component={NextLink} href={href} underline="hover" color="inherit">{label}</Link>;
    })}
  </Breadcrumbs>;
}
