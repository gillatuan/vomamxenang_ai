export const homeDesign = {
  colors: {
    ink: "#17324D",
    accent: "#F59E0B",
    surface: "#F8FAFC",
    muted: "#64748B",
    border: "#E2E8F0",
  },
  containerWidth: 1280,
  sectionPadding: { xs: 6, md: 10 },
  categoryLinks: [
    { title: "Vỏ xe nâng", href: "/vo-xe-nang", description: "Lốp đặc và lốp hơi theo tải trọng, kích thước" },
    { title: "Mâm xe nâng", href: "/mam-xe-nang", description: "Mâm phù hợp từng dòng xe và cấu hình bánh" },
    { title: "Dịch vụ ép vỏ", href: "/services", description: "Tư vấn, ép và thay vỏ xe nâng" },
  ],
  popularSizes: ["6.00-9", "6.50-10", "7.00-12", "18x7-8", "21x8-9"],
} as const;
