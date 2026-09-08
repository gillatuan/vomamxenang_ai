"use client";

import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  useTheme,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api-client";
import { useAuth } from "@/context/auth";
import GoBackButton from "@/components/GoBackButton";

export default function LoginPage() {
  const theme = useTheme();
  const [email, setEmail] = useState("admin@vomamxenang.local");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Vui lòng nhập email và mật khẩu");
      return;
    }

    setLoading(true);

    try {
      const res = await authAPI.login(email, password);
      login(res.data.accessToken, res.data.user);
      router.push("/admin");
    } catch (err: any) {
      setError(err.response?.data?.message || "Đăng nhập thất bại. Kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ paddingTop: "5rem" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "3rem",
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          boxShadow: theme.shadows[3],
        }}
      >
        <GoBackButton />
        <Avatar sx={{ m: 1, bgcolor: theme.palette.primary.main }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Đăng nhập hệ thống
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: "center" }}>
          Nhập thông tin đăng nhập để truy cập quản trị kho và vận hành.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: "100%", mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleLogin} sx={{ width: "100%" }}>
          <TextField
            label="Email"
            type="email"
            margin="normal"
            required
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <TextField
            label="Mật khẩu"
            type="password"
            margin="normal"
            required
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng nhập"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
