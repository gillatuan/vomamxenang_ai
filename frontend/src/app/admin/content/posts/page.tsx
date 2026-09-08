"use client";
import ContentSeoFields from "@/components/ContentSeoFields";
import type { SeoMetadata } from "@/lib/api-client";
import RichTextEditor from "@/components/RichTextEditor";
import RichTextContent from "@/components/RichTextContent";
import { richTextPlain } from "@/lib/rich-text";

import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { AdminGridState } from "@/components/admin/AdminGridState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContentStatus, Post, postsAPI } from "@/lib/api-client";

type PostForm = { slug: string; seo: SeoMetadata; title: string; content: string; videoUrl: string; status: ContentStatus };
const emptyForm: PostForm = { slug: "", seo: {}, title: "", content: "", videoUrl: "", status: "DRAFT" };

export default function PostsAdminPage() {
  const [rows, setRows] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Post | null>(null);
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<Post | null>(null);
  const [form, setForm] = useState<PostForm>(emptyForm);

  const load = () => {
    setLoading(true);
    setError(null);
    postsAPI.getAllAdmin().then((response) => setRows(response.data)).catch(() => setError("Không thể tải danh sách bài viết.")).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openEditor = (post?: Post) => {
    setEditing(post ?? null);
    setForm(post ? { slug: post.slug || "", seo: post.seo || {}, title: post.title, content: post.content, videoUrl: post.videoUrl ?? "", status: post.status ?? "PUBLISHED" } : emptyForm);
    setOpen(true);
  };

  const save = async (status: ContentStatus) => {
    const data = { slug: form.slug, seo: { ...form.seo, keywords: (form.seo.keywords || []).map(word => word.trim()).filter(Boolean) }, title: form.title.trim(), content: form.content.trim(), videoUrl: form.videoUrl.trim() || undefined, status };
    if (!data.title || !richTextPlain(data.content)) { setError("Vui lòng nhập tiêu đề và nội dung bài viết."); return; }
    try {
      if (editing) await postsAPI.update(editing.id, data); else await postsAPI.create(data);
      setOpen(false);
      load();
    } catch (error: any) { setError(error.response?.data?.message || "Không thể lưu bài viết."); }
  };

  const changeStatus = async (post: Post) => {
    const currentStatus = post.status ?? "PUBLISHED";
    try {
      await postsAPI.update(post.id, { status: currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED" });
      load();
    } catch { setError("Không thể cập nhật trạng thái bài viết."); }
  };

  const remove = async (id: string) => {
    if (!window.confirm("Xóa bài viết này?")) return;
    try { await postsAPI.delete(id); load(); } catch { setError("Không thể xóa bài viết."); }
  };

  const columns: GridColDef<Post>[] = [
    { field: "title", headerName: "Tiêu đề", flex: 1.4 },
    { field: "content", headerName: "Nội dung", flex: 2.4, valueGetter: (_, row) => richTextPlain(row.content).slice(0, 180) },
    { field: "status", headerName: "Trạng thái", width: 130, renderCell: (params: GridRenderCellParams<Post>) => {
      const status = params.row.status ?? "PUBLISHED";
      return <Chip size="small" label={status === "PUBLISHED" ? "Đã publish" : "Nháp"} color={status === "PUBLISHED" ? "success" : "default"} />;
    } },
    { field: "actions", headerName: "Thao tác", sortable: false, width: 310, renderCell: (params: GridRenderCellParams<Post>) => {
      const status = params.row.status ?? "PUBLISHED";
      return <>
        <Button size="small" startIcon={<VisibilityIcon />} onClick={() => setViewing(params.row)}>Xem</Button>
        <Button size="small" color={status === "DRAFT" ? "success" : "inherit"} onClick={() => changeStatus(params.row)}>{status === "DRAFT" ? "Publish" : "Về nháp"}</Button>
        <IconButton aria-label="Sửa" onClick={() => openEditor(params.row)}><EditIcon /></IconButton>
        <IconButton aria-label="Xóa" color="error" onClick={() => remove(params.row.id)}><DeleteIcon /></IconButton>
      </>;
    } },
  ];

  return <Box>
    <AdminPageHeader title="Bài viết" actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => openEditor()}>Tạo bài viết</Button>} />
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <AdminGridState loading={loading} error={Boolean(error)} empty={!loading && !error && !rows.length} />
    {!loading && !error && rows.length > 0 && <DataGrid autoHeight rows={rows} columns={columns} disableRowSelectionOnClick />}
    <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
      <DialogTitle>{editing ? "Chỉnh sửa bài viết" : "Tạo bài viết"}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField autoFocus required fullWidth label="Tiêu đề" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} sx={{ mt: 1, mb: 2 }} />
        <ContentSeoFields id={editing?.id} kind="blog" title={form.title} content={form.content} slug={form.slug} seo={form.seo} onChange={(data) => setForm(current => ({ ...current, ...data }))} onContentChange={(content) => setForm(current => ({ ...current, content }))} />
        <RichTextEditor label="Nội dung" value={form.content} onChange={(content) => setForm({ ...form, content })} />
        <TextField fullWidth label="Video URL (không bắt buộc)" value={form.videoUrl} onChange={(event) => setForm({ ...form, videoUrl: event.target.value })} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Hủy</Button>
        <Button variant="outlined" onClick={() => save("DRAFT")}>Lưu nháp</Button>
        <Button variant="contained" onClick={() => save("PUBLISHED")}>Publish</Button>
      </DialogActions>
    </Dialog>
    <Dialog open={Boolean(viewing)} onClose={() => setViewing(null)} maxWidth="md" fullWidth>
      <DialogTitle>{viewing?.title}</DialogTitle>
      <DialogContent><RichTextContent value={viewing?.content} />{viewing?.videoUrl && <Box sx={{ mt: 2 }}><a href={viewing.videoUrl} target="_blank" rel="noreferrer">Mở video đính kèm</a></Box>}</DialogContent>
      <DialogActions><Button onClick={() => setViewing(null)}>Đóng</Button><Button variant="contained" onClick={() => { if (viewing) { setViewing(null); openEditor(viewing); } }}>Chỉnh sửa</Button></DialogActions>
    </Dialog>
  </Box>;
}
