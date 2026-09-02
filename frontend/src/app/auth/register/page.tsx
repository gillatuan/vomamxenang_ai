"use client";

import { Box, Container, TextField, Button, Typography, Alert, CircularProgress, Link as MuiLink } from "@mui/material";
import NextLink from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api-client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      setLoading(false);
      return;
    }
    try {
      await authAPI.register(email, password);
      setSuccess("Đăng ký thành công. Vui lòng đăng nhập.");
      setTimeout(() => router.push("/admin/login"), 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ pt: 8 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 3, bgcolor: "background.paper", borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Đăng ký</Typography>
        <MuiLink component={NextLink} href="/admin/login">← Quay lại Đăng nhập</MuiLink>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField label="Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mt: 2 }} />
          <TextField label="Mật khẩu" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mt: 2 }} />
          <TextField label="Nhập lại mật khẩu" type="password" fullWidth required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} sx={{ mt: 2 }} />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>{loading ? <CircularProgress size={20} /> : "Đăng ký"}</Button>
        </Box>
      </Box>
    </Container>
  );
}
