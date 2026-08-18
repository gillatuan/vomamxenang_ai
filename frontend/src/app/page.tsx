"use client";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { Box, Container, Typography, Button, Grid } from "@mui/material";
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
      <Box component="section" sx={{ backgroundColor: "#fff8f1", py: { xs: 5, md: 7 } }}>
        <Container maxWidth="md" sx={{ textAlign: "center" }}>
          <Typography component="h2" variant="h4" fontWeight={800} sx={{ color: "#5d3416", mb: 2 }}>
            {about.title}
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: { xs: "1rem", md: "1.15rem" }, lineHeight: 1.8, mb: 3 }}>
            {about.summary}
          </Typography>
          <Button component={NextLink} href="/about" variant="outlined" color="primary" size="large">
            Xem thêm về chúng tôi
          </Button>
        </Container>
      </Box>
      <Box
        sx={{
          backgroundImage:
            "linear-gradient(135deg, #F57C00 0%, #424242 100%)",
          color: "white",
          padding: "4rem 0",
          textAlign: "center",
        }}
      >
        <Container>
          <Typography variant="h3" sx={{ marginBottom: "1rem", fontWeight: "bold" }}>
            Võ Mâm Xe Nâng
          </Typography>
          <Typography variant="h6" sx={{ marginBottom: "2rem" }}>
            Chuyên cung cấp lốp, vành, dịch vụ bảo dưỡng xe nâng chất lượng cao
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            href="/products"
          >
            Xem sản phẩm
          </Button>
        </Container>
      </Box>

      <Container sx={{ padding: "4rem 0" }}>
        <Typography variant="h4" sx={{ marginBottom: "2rem", textAlign: "center" }}>
          Video giới thiệu
        </Typography>
        <Grid container spacing={2}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Box
                sx={{
                  width: "100%",
                  paddingBottom: "56.25%",
                  position: "relative",
                  backgroundColor: "#f0f0f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                <iframe
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  allowFullScreen
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      <Footer />
    </>
  );
}
