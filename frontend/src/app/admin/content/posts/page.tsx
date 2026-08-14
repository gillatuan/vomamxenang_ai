"use client";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { AdminGridState } from "@/components/admin/AdminGridState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Post, postsAPI } from "@/lib/api-client";

export default function PostsAdminPage() {
  const [rows, setRows] = useState<Post[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  const [editing, setEditing] = useState<Post | null>(null); const [open, setOpen] = useState(false); const [form, setForm] = useState({ title: "", content: "", videoUrl: "" });
  const load = () => { setLoading(true); postsAPI.getAll().then((response) => setRows(response.data)).catch(() => setError(true)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const save = async () => { const data = { title: form.title.trim(), content: form.content.trim(), videoUrl: form.videoUrl.trim() || undefined }; if (!data.title || !data.content) return; if (editing) await postsAPI.update(editing.id, data); else await postsAPI.create(data); setOpen(false); load(); };
  const remove = async (id: string) => { if (window.confirm("Xóa bài viết này?")) { await postsAPI.delete(id); load(); } };
  const columns: GridColDef<Post>[] = [
    { field: "title", headerName: "Tiêu đề", flex: 1.4 }, { field: "content", headerName: "Nội dung", flex: 2.4, valueGetter: (_, row) => row.content.slice(0, 180) },
    { field: "actions", headerName: "Thao tác", sortable: false, width: 120, renderCell: (params: GridRenderCellParams<Post>) => <><IconButton aria-label="Sửa" onClick={() => { setEditing(params.row); setForm({ title: params.row.title, content: params.row.content, videoUrl: params.row.videoUrl ?? "" }); setOpen(true); }}><EditIcon /></IconButton><IconButton aria-label="Xóa" color="error" onClick={() => remove(params.row.id)}><DeleteIcon /></IconButton></> },
  ];
  return <Box><AdminPageHeader title="Bài viết" actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setForm({ title: "", content: "", videoUrl: "" }); setOpen(true); }}>Tạo bài viết</Button>} /><AdminGridState loading={loading} error={error} empty={!loading && !error && !rows.length} />{!loading && !error && rows.length > 0 && <DataGrid autoHeight rows={rows} columns={columns} disableRowSelectionOnClick />}<Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth><DialogTitle>{editing ? "Chỉnh sửa bài viết" : "Tạo bài viết"}</DialogTitle><DialogContent><TextField autoFocus required fullWidth label="Tiêu đề" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} sx={{ mt: 1, mb: 2 }} /><TextField required fullWidth multiline minRows={8} label="Nội dung" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} sx={{ mb: 2 }} /><TextField fullWidth label="Video URL (không bắt buộc)" value={form.videoUrl} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} /></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Hủy</Button><Button variant="contained" onClick={save}>Lưu</Button></DialogActions></Dialog></Box>;
}
