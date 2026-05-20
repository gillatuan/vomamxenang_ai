"use client";

import { Box, Container, TextField, Button, Typography, Alert, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api-client";
import { useAuth } from "@/context/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@vomamxenang.local");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authAPI.login(email, password);
      login(res.data.accessToken, res.data.user);
      router.push("/admin");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ paddingTop: "4rem" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "2rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: "2rem", fontWeight: "bold" }}>
          Đăng nhập Admin
        </Typography>

        {error && <Alert severity="error" sx={{ marginBottom: "1rem", width: "100%" }}>{error}</Alert>}

        <Box component="form" onSubmit={handleLogin} sx={{ width: "100%" }}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            fullWidth
            label="Mật khẩu"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ marginTop: "2rem" }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Đăng nhập"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
