"use client";

import { Box, Container, TextField, Button, Typography, Alert, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api-client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authAPI.register(email, password);
      setSuccess("Đăng ký thành công. Vui lòng đăng nhập.");
      setTimeout(() => router.push("/auth/login"), 1200);
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
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
          <TextField label="Email" type="email" fullWidth required value={email} onChange={(e) => setEmail(e.target.value)} sx={{ mt: 2 }} />
          <TextField label="Mật khẩu" type="password" fullWidth required value={password} onChange={(e) => setPassword(e.target.value)} sx={{ mt: 2 }} />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>{loading ? <CircularProgress size={20} /> : "Đăng ký"}</Button>
        </Box>
      </Box>
    </Container>
  );
}
