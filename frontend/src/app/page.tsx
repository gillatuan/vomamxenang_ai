"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { Box, Container, Typography, Button, Grid, Stack } from "@mui/material";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { aboutAPI, type AboutPage } from "@/lib/api-client";

const fallbackAbout = {
  title: "Về Võ Mâm Xe Nâng",
  summary: "Chúng tôi cung cấp lốp, mâm và dịch vụ bảo dưỡng xe nâng, giúp doanh nghiệp vận hành an toàn, bền bỉ và hiệu quả.",
};

export default function HomePage() {
  const [about, setAbout] = useState<Pick<AboutPage, "title" | "summary">>(fallbackAbout);

  useEffect(() => {
    aboutAPI.getPublic().then(({ data }) => {
      if (data) setAbout({ title: data.title, summary: data.summary });
    }).catch(() => undefined);
  }, []);

  return (
    <>
      <Header />
      <Box
        component="section"
        sx={{
          position: "relative",
          overflow: "hidden",
          minHeight: { xs: 510, md: 650 },
          display: "flex",
          alignItems: "flex-end",
          color: "#fff",
          background: "linear-gradient(118deg, #171716 0%, #25241f 49%, #6d5136 100%)",
          "&:before": { content: '""', position: "absolute", width: { xs: 340, md: 620 }, height: { xs: 340, md: 620 }, border: "1px solid rgba(255,255,255,.25)", borderRadius: "50%", right: { xs: -170, md: -120 }, top: { xs: -130, md: -210 } },
          "&:after": { content: '""', position: "absolute", width: "44%", height: "100%", right: 0, top: 0, opacity: .18, backgroundImage: "repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 58px)" },
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: 1440, width: "100%", py: { xs: 7, md: 10 }, position: "relative", zIndex: 1 }}>
          <Typography sx={{ fontSize: ".7rem", letterSpacing: ".18em", fontWeight: 800, mb: 2, color: "#dec19e" }}>VÕ MÂM XE NÂNG · INDUSTRIAL MOBILITY</Typography>
          <Typography component="h1" variant="h1" sx={{ maxWidth: 860, textTransform: "uppercase" }}>
            Vận hành bền bỉ.<br />Hiệu suất dài lâu.
          </Typography>
          <Typography sx={{ maxWidth: 570, mt: 3, mb: 4, fontSize: { xs: "1rem", md: "1.16rem" }, lineHeight: 1.7, color: "rgba(255,255,255,.78)" }}>
            Chuyên cung cấp lốp, mâm và giải pháp bảo dưỡng xe nâng cho đội xe làm việc trong điều kiện khắc nghiệt nhất.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}><Button component={NextLink} href="/products" sx={{ bgcolor: "#fff", color: "#1a1a1a", "&:hover": { bgcolor: "#dec19e" } }}>Khám phá sản phẩm</Button><Button component={NextLink} href="/about" variant="outlined" sx={{ borderColor: "rgba(255,255,255,.7)", color: "#fff", "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,.12)" } }}>Về chúng tôi</Button></Stack>
        </Container>
      </Box>
      <Container component="section" maxWidth={false} sx={{ maxWidth: 1440, py: { xs: 7, md: 12 } }}>
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center"><Grid item xs={12} md={5}><Typography sx={{ fontSize: ".68rem", letterSpacing: ".16em", fontWeight: 800, mb: 2, color: "secondary.main" }}>GIẢI PHÁP ĐỒNG HÀNH</Typography><Typography component="h2" variant="h2">{about.title}</Typography></Grid><Grid item xs={12} md={7}><Typography color="text.secondary" sx={{ fontSize: { xs: "1.08rem", md: "1.35rem" }, lineHeight: 1.7, maxWidth: 690 }}>{about.summary}</Typography><Button component={NextLink} href="/about" variant="text" sx={{ px: 0, mt: 3, color: "#1a1a1a", textDecoration: "underline", textUnderlineOffset: "6px" }}>Tìm hiểu thêm</Button></Grid></Grid>
      </Container>
      <Box component="section" sx={{ bgcolor: "#e9e5dc", py: { xs: 5, md: 7 } }}><Container maxWidth={false} sx={{ maxWidth: 1440 }}><Grid container spacing={3}>{[["01", "Tư vấn đúng tải trọng"], ["02", "Sản phẩm tuyển chọn"], ["03", "Hỗ trợ sau bán hàng"]].map(([number, text]) => <Grid item xs={12} md={4} key={number}><Typography sx={{ color: "secondary.main", fontSize: ".76rem", letterSpacing: ".16em", fontWeight: 800, mb: 1 }}>{number}</Typography><Typography variant="h5" sx={{ fontWeight: 500 }}>{text}</Typography></Grid>)}</Grid></Container></Box>

      <Footer />
    </>
  );
}
