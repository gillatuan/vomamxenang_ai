"use client";

import { Box, Container, Typography, Button, Grid } from "@mui/material";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
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
            Võ Mạnh Xe Nâng
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
