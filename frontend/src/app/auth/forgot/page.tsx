"use client";

import { Box, Container, TextField, Button, Typography, Alert, CircularProgress, Link as MuiLink } from "@mui/material";
import NextLink from "next/link";
import { useState } from "react";
import { authAPI } from "@/lib/api-client";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await authAPI.forgotPassword(email);
      setMessage("Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu (hiện hiển thị trên console cho môi trường dev).");
    } catch (err: any) {
      setMessage("Yêu cầu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ pt: 8 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 3, bgcolor: "background.paper", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Quên mật khẩu</Typography>
        <MuiLink component={NextLink} href="/admin/login">← Quay lại Đăng nhập</MuiLink>
        {message && <Alert severity="info">{message}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField label="Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mt: 2 }} />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>{loading ? <CircularProgress size={20} /> : "Gửi mã khôi phục"}</Button>
        </Box>
      </Box>
    </Container>
  );
}
