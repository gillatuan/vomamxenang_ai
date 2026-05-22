"use client";

import { Box, Container, Typography, Grid } from "@mui/material";

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#333",
        color: "white",
        padding: "2rem 0",
        marginTop: "4rem",
      }}
    >
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6">Về chúng tôi</Typography>
            <Typography variant="body2">
              Chuyên cung cấp lốp và phụ tùng xe nâng chất lượng cao từ các nhà sản xuất hàng đầu.
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6">Liên hệ</Typography>
            <Typography variant="body2">Email: info@vomamxenang.com</Typography>
            <Typography variant="body2">Phone: 0905 123 456</Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6">Theo dõi</Typography>
            <Typography variant="body2">Facebook | Instagram | YouTube</Typography>
          </Grid>
        </Grid>
        <Typography variant="body2" sx={{ marginTop: "2rem", textAlign: "center" }}>
          © 2026 Võ Mâm Xe Nâng. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
