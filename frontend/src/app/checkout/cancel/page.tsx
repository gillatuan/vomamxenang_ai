"use client";

import { Box, Container, Typography, Button, Card, CardContent } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import NextLink from "next/link";

export default function CheckoutCancelPage() {
  return (
    <Container maxWidth="sm" sx={{ paddingTop: "4rem", textAlign: "center" }}>
      <Card>
        <CardContent sx={{ padding: "3rem" }}>
          <CancelIcon
            sx={{ fontSize: "4rem", color: "#f44336", marginBottom: "1rem" }}
          />
          <Typography variant="h4" sx={{ marginBottom: "1rem", fontWeight: "bold" }}>
            Thanh toán bị hủy
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: "2rem", color: "textSecondary" }}>
            Bạn đã hủy phiên thanh toán. Giỏ hàng của bạn vẫn được lưu, bạn có thể tiếp tục mua sắm.
          </Typography>
          <Box sx={{ display: "flex", gap: "1rem" }}>
            <Button variant="outlined" component={NextLink} href="/products" fullWidth>
              Tiếp tục mua
            </Button>
            <Button variant="contained" component={NextLink} href="/" fullWidth>
              Trang chủ
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
