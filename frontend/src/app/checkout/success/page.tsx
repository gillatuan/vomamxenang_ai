"use client";

import { Container, Typography, Button, Card, CardContent } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import NextLink from "next/link";

export default function CheckoutSuccessPage() {
  return (
    <Container maxWidth="sm" sx={{ paddingTop: "4rem", textAlign: "center" }}>
      <Card>
        <CardContent sx={{ padding: "3rem" }}>
          <CheckCircleIcon
            sx={{ fontSize: "4rem", color: "#4caf50", marginBottom: "1rem" }}
          />
          <Typography variant="h4" sx={{ marginBottom: "1rem", fontWeight: "bold" }}>
            Thanh toán thành công!
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: "2rem", color: "textSecondary" }}>
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận và sẽ được giao trong thời gian sớm nhất.
          </Typography>
          <Button variant="contained" component={NextLink} href="/" fullWidth>
            Quay về trang chủ
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}
