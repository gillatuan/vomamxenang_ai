"use client";

import { Alert, Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import { FormEvent, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cacheAPI } from "@/lib/api-client";

type Scope = "ALL" | "PRODUCT" | "POST" | "PATH";

export default function CacheAdminPage() {
  const [scope, setScope] = useState<Scope>("ALL");
  const [id, setId] = useState("");
  const [path, setPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const purge = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null); setError(null);
    if ((scope === "PRODUCT" || scope === "POST") && !id.trim()) { setError("Vui lòng nhập ID nội dung cần xóa cache."); return; }
    if (scope === "PATH" && !path.startsWith("/")) { setError("Đường dẫn phải bắt đầu bằng dấu /."); return; }
    setLoading(true);
    try {
      const response = await cacheAPI.purge({ scope, id: id.trim() || undefined, path: path.trim() || undefined });
      setMessage(`Đã yêu cầu làm mới cache: ${response.data.paths.join(", ")}`);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || "Không thể xóa cache. Kiểm tra cấu hình revalidation trên Vercel.");
    } finally { setLoading(false); }
  };

  return <Box>
    <AdminPageHeader title="Xóa cache website" />
    <Typography color="text.secondary" sx={{ mb: 3 }}>Dùng khi nội dung công khai chưa cập nhật sau khi publish. Chức năng này chỉ làm mới Next.js Data Cache, không xóa dữ liệu sản phẩm hay bài viết.</Typography>
    {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Box component="form" onSubmit={purge} sx={{ maxWidth: 620 }}>
      <Stack spacing={2}>
        <TextField select label="Phạm vi xóa cache" value={scope} onChange={(event) => setScope(event.target.value as Scope)}>
          <MenuItem value="ALL">Toàn bộ website công khai</MenuItem>
          <MenuItem value="PRODUCT">Một sản phẩm</MenuItem>
          <MenuItem value="POST">Một bài viết</MenuItem>
          <MenuItem value="PATH">Một đường dẫn cụ thể</MenuItem>
        </TextField>
        {(scope === "PRODUCT" || scope === "POST") && <TextField required label={`ID ${scope === "PRODUCT" ? "sản phẩm" : "bài viết"}`} value={id} onChange={(event) => setId(event.target.value)} helperText="Lấy ID từ URL chi tiết hiện tại." />}
        {scope === "PATH" && <TextField required label="Đường dẫn" placeholder="/products hoặc /blog/abc" value={path} onChange={(event) => setPath(event.target.value)} />}
        <Button type="submit" variant="contained" color="warning" startIcon={<DeleteSweepIcon />} disabled={loading}>{loading ? "Đang xóa cache..." : "Xóa cache ngay"}</Button>
      </Stack>
    </Box>
  </Box>;
}
