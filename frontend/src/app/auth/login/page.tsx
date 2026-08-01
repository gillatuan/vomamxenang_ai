"use client";

import { Box, Container, TextField, Button, Typography, Alert, CircularProgress, Avatar, Link as MuiLink, Stack } from "@mui/material";
import NextLink from "next/link";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api-client";
import { useAuth } from "@/context/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await authAPI.login(email, password);
      login(res.data.accessToken, res.data.user);
      router.push("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ pt: 8 }}>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", p: 3, bgcolor: "background.paper", borderRadius: 2 }}>
        <Avatar sx={{ bgcolor: "primary.main", mb: 1 }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography variant="h6" sx={{ mb: 2 }}>Đăng nhập</Typography>
        <MuiLink component={NextLink} href="/" sx={{ alignSelf: "flex-start" }}>← Quay lại Trang Chủ</MuiLink>
        {error && <Alert severity="error">{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField label="Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mt: 2 }} />
          <TextField label="Mật khẩu" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mt: 2 }} />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>{loading ? <CircularProgress size={20} /> : "Đăng nhập"}</Button>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
            <MuiLink component={NextLink} href="/auth/register">Đăng ký tài khoản mới</MuiLink>
            <MuiLink component={NextLink} href="/auth/forgot">Quên mật khẩu?</MuiLink>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}
