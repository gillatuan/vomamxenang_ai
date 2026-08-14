"use client";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { AdminGridState } from "@/components/admin/AdminGridState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminManagementAPI } from "@/lib/api-client";
type UserRow = { id: string; email: string; role: "ADMIN_MANAGER" | "STOREKEEPER"; createdAt: string };

export default function UsersPage() {
  const [rows, setRows] = useState<UserRow[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false); const [open, setOpen] = useState(false); const [editing, setEditing] = useState<UserRow | null>(null); const [form, setForm] = useState({ email: "", password: "", role: "STOREKEEPER" as UserRow["role"] });
  const load = () => { setLoading(true); adminManagementAPI.users().then((response) => setRows(response.data as UserRow[])).catch(() => setError(true)).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const save = async () => { if (editing) await adminManagementAPI.updateUser(editing.id, { role: form.role, ...(form.password ? { password: form.password } : {}) }); else if (form.email && form.password) await adminManagementAPI.createUser(form); setOpen(false); load(); };
  const columns: GridColDef<UserRow>[] = [{ field: "email", headerName: "Email", flex: 1.5 }, { field: "role", headerName: "Vai trò", flex: 1 }, { field: "createdAt", headerName: "Ngày tạo", flex: 1, valueFormatter: (value) => new Date(value).toLocaleString("vi-VN") }, { field: "actions", headerName: "Thao tác", width: 90, sortable: false, renderCell: (params: GridRenderCellParams<UserRow>) => <Button size="small" startIcon={<EditIcon />} onClick={() => { setEditing(params.row); setForm({ email: params.row.email, password: "", role: params.row.role }); setOpen(true); }}>Sửa</Button> }];
  return <Box><AdminPageHeader title="Người dùng" description="Tài khoản chỉ hiển thị thông tin an toàn; mật khẩu luôn được băm ở backend." actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditing(null); setForm({ email: "", password: "", role: "STOREKEEPER" }); setOpen(true); }}>Tạo tài khoản</Button>} /><AdminGridState loading={loading} error={error} empty={!loading && !error && !rows.length} />{!loading && !error && rows.length > 0 && <DataGrid autoHeight rows={rows} columns={columns} disableRowSelectionOnClick />}<Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth><DialogTitle>{editing ? "Cập nhật tài khoản" : "Tạo tài khoản"}</DialogTitle><DialogContent>{!editing && <TextField autoFocus required fullWidth type="email" label="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} sx={{ mt: 1, mb: 2 }} />}<TextField required={!editing} fullWidth type="password" label={editing ? "Mật khẩu mới (để trống nếu giữ nguyên)" : "Mật khẩu"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} sx={{ mt: editing ? 1 : 0, mb: 2 }} /><TextField select fullWidth label="Vai trò" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as UserRow["role"] })}><MenuItem value="STOREKEEPER">STOREKEEPER</MenuItem><MenuItem value="ADMIN_MANAGER">ADMIN_MANAGER</MenuItem></TextField></DialogContent><DialogActions><Button onClick={() => setOpen(false)}>Hủy</Button><Button variant="contained" onClick={save}>Lưu</Button></DialogActions></Dialog></Box>;
}
