"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import { Alert, Box, IconButton } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { AdminGridState } from "@/components/admin/AdminGridState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminManagementAPI } from "@/lib/api-client";

type Row = { id: string; content: string; createdAt: string; post: { title: string }; user: { email: string } };
export default function PostCommentsPage() {
  const [rows, setRows] = useState<Row[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const load = () => { setLoading(true); setError(null); adminManagementAPI.postComments().then((response) => setRows(response.data)).catch(() => setError("Không thể tải bình luận bài viết.")).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const remove = async (id: string) => {
    if (!window.confirm("Xóa bình luận này? Thao tác không thể hoàn tác.")) return;
    const previous = rows; setRows((value) => value.filter((row) => row.id !== id));
    try { await adminManagementAPI.deletePostComment(id); } catch { setRows(previous); setError("Không thể xóa bình luận."); }
  };
  const columns: GridColDef<Row>[] = [
    { field: "post", headerName: "Bài viết", flex: 1.5, valueGetter: (_, row) => row.post.title }, { field: "user", headerName: "Người dùng", flex: 1, valueGetter: (_, row) => row.user.email }, { field: "content", headerName: "Bình luận", flex: 2 },
    { field: "createdAt", headerName: "Ngày tạo", flex: 1, valueFormatter: (value) => new Date(value).toLocaleString("vi-VN") },
    { field: "actions", headerName: "Thao tác", width: 90, sortable: false, renderCell: (params: GridRenderCellParams<Row>) => <IconButton aria-label="Xóa bình luận" color="error" onClick={() => remove(params.row.id)}><DeleteIcon /></IconButton> },
  ];
  return <Box><AdminPageHeader title="Bình luận bài viết" description="Kiểm duyệt bình luận do khách hàng gửi." />{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<AdminGridState loading={loading} error={Boolean(error) && !rows.length} empty={!loading && !error && !rows.length} />{!loading && rows.length > 0 && <DataGrid autoHeight rows={rows} columns={columns} disableRowSelectionOnClick />}</Box>;
}
