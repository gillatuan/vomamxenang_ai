"use client";

import { useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, Switch, TextField } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { AdminGridState } from "@/components/admin/AdminGridState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { aboutAPI, type AboutPage, type AboutPageInput } from "@/lib/api-client";

const empty: AboutPageInput = { title: "", summary: "", content: "", imageUrl: "", isPublished: true };

export default function AboutAdminPage() {
  const [rows, setRows] = useState<AboutPage[]>([]);
  const [form, setForm] = useState<AboutPageInput>(empty);
  const [editing, setEditing] = useState<AboutPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true); setError("");
    aboutAPI.getAll().then(({ data }) => setRows(data)).catch(() => setError("Không thể tải nội dung giới thiệu.")).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const startEdit = (row: AboutPage) => {
    setEditing(row);
    setForm({ title: row.title, summary: row.summary, content: row.content, imageUrl: row.imageUrl || "", isPublished: row.isPublished });
    setOpen(true);
  };
  const save = async () => {
    if (!form.title.trim() || !form.summary.trim() || !form.content.trim()) { setError("Tiêu đề, tóm tắt và nội dung là bắt buộc."); return; }
    const payload = { ...form, title: form.title.trim(), summary: form.summary.trim(), content: form.content.trim(), imageUrl: form.imageUrl?.trim() || undefined };
    try {
      if (editing) await aboutAPI.update(editing.id, payload); else await aboutAPI.create(payload);
      setOpen(false); load();
    } catch (err: any) {
      const message = err.response?.data?.message;
      setError(Array.isArray(message) ? message.join(", ") : message || "Không thể lưu nội dung giới thiệu.");
    }
  };
  const remove = async (id: string) => {
    if (!window.confirm("Xóa nội dung giới thiệu này?")) return;
    try { await aboutAPI.delete(id); load(); } catch { setError("Không thể xóa nội dung giới thiệu."); }
  };
  const columns: GridColDef<AboutPage>[] = [
    { field: "title", headerName: "Tiêu đề", flex: 1.1 },
    { field: "summary", headerName: "Tóm tắt", flex: 2, valueGetter: (_, row) => row.summary.slice(0, 180) },
    { field: "isPublished", headerName: "Hiển thị", width: 110, valueGetter: (_, row) => row.isPublished ? "Đang hiển thị" : "Tạm ẩn" },
    { field: "actions", headerName: "Thao tác", width: 115, sortable: false, renderCell: (params: GridRenderCellParams<AboutPage>) => <><IconButton aria-label="Sửa" onClick={() => startEdit(params.row)}><EditIcon /></IconButton><IconButton aria-label="Xóa" color="error" onClick={() => remove(params.row.id)}><DeleteIcon /></IconButton></> },
  ];

  return <Box>
    <AdminPageHeader title="Giới thiệu" actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}>Tạo nội dung</Button>} />
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <AdminGridState loading={loading} error={false} empty={!loading && !rows.length} />
    {!loading && rows.length > 0 && <DataGrid autoHeight rows={rows} columns={columns} disableRowSelectionOnClick />}
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
      <DialogTitle>{editing ? "Cập nhật" : "Tạo"} nội dung giới thiệu</DialogTitle>
      <DialogContent>
        <TextField autoFocus fullWidth required label="Tiêu đề" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} sx={{ mt: 1, mb: 2 }} />
        <TextField fullWidth required multiline minRows={3} label="Tóm tắt" value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} sx={{ mb: 2 }} />
        <TextField fullWidth required multiline minRows={9} label="Nội dung đầy đủ" value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} sx={{ mb: 2 }} />
        <TextField fullWidth label="Ảnh minh họa URL (không bắt buộc)" value={form.imageUrl || ""} onChange={(event) => setForm({ ...form, imageUrl: event.target.value })} />
        <FormControlLabel sx={{ mt: 1 }} control={<Switch checked={form.isPublished} onChange={(event) => setForm({ ...form, isPublished: event.target.checked })} />} label="Hiển thị công khai" />
      </DialogContent>
      <DialogActions><Button onClick={() => setOpen(false)}>Hủy</Button><Button variant="contained" onClick={save}>Lưu</Button></DialogActions>
    </Dialog>
  </Box>;
}
