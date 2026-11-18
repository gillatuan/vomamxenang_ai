"use client";

import { useEffect, useId, useState } from "react";
import { Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Slider, Stack, TextField, Typography } from "@mui/material";
import { EditorContent, useEditor } from "@tiptap/react";
import { mergeAttributes, Node } from "@tiptap/core";
import { postsAPI, productsAPI } from "@/lib/api-client";
import { contentPath, RelatedContent } from "@/lib/content-seo";
import StarterKit from "@tiptap/starter-kit";
import apiClient from "@/lib/api";
import { richTextHtml, richTextStyles } from "@/lib/rich-text";

// StarterKit does not include media nodes. Defining these nodes here keeps
// existing <figure><img /><figcaption /></figure> HTML visible and intact when
// an administrator reopens and saves a post.
const EmbeddedImage = Node.create({
  name: "embeddedImage",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      loading: { default: "lazy" },
    };
  },
  parseHTML() { return [{ tag: "img[src]" }]; },
  renderHTML({ HTMLAttributes }) { return ["img", mergeAttributes(HTMLAttributes)]; },
});

const FigureCaption = Node.create({
  name: "figureCaption",
  content: "inline*",
  parseHTML() { return [{ tag: "figcaption" }]; },
  renderHTML({ HTMLAttributes }) { return ["figcaption", mergeAttributes(HTMLAttributes), 0]; },
});

const EmbeddedVideo = Node.create({
  name: "embeddedVideo",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
      controls: { default: true },
      preload: { default: "metadata" },
      playsinline: { default: true },
    };
  },
  parseHTML() { return [{ tag: "video[src]" }]; },
  renderHTML({ HTMLAttributes }) {
    return ["video", mergeAttributes(HTMLAttributes, { controls: "", preload: "metadata", playsinline: "" })];
  },
});

const EmbeddedFigure = Node.create({
  name: "embeddedFigure",
  group: "block",
  content: "(embeddedImage | embeddedVideo) figureCaption?",
  isolating: true,
  parseHTML() { return [{ tag: "figure" }]; },
  renderHTML({ HTMLAttributes }) { return ["figure", mergeAttributes(HTMLAttributes), 0]; },
});

export default function RichTextEditor({ label, value, onChange, enableMedia = false }: { label: string; value: string; onChange: (value: string) => void; enableMedia?: boolean }) {
  const id = useId();
  const [related, setRelated] = useState<RelatedContent[]>([]);
  const [mediaBusy, setMediaBusy] = useState(false);
  const [cropImage, setCropImage] = useState<{file: File; bitmap: ImageBitmap} | null>(null);
  const [zoom, setZoom] = useState(1);
  const [cropX, setCropX] = useState(50);
  const [cropY, setCropY] = useState(50);
  const [preview, setPreview] = useState<HTMLCanvasElement | null>(null);
  const [mediaError, setMediaError] = useState("");
  const [videoOpen, setVideoOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  const [relatedError, setRelatedError] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [linkError, setLinkError] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false } }), EmbeddedImage, EmbeddedVideo, FigureCaption, EmbeddedFigure],
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    content: richTextHtml(value),
    editorProps: { attributes: { role: "textbox", "aria-multiline": "true", "aria-labelledby": id } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML() && !(editor.isEmpty && !value)) {
      editor.commands.setContent(richTextHtml(value), { emitUpdate: false });
    }
  }, [editor, value]);

  useEffect(() => {
    if (!linkOpen) return;
    let active = true;
    setRelatedError(false);
    Promise.all([productsAPI.getAll(), postsAPI.getAll()]).then(([products, posts]) => {
      if (active) setRelated([...products.data.map(item => ({ ...item, kind: 'products' as const })), ...posts.data.map(item => ({ ...item, kind: 'blog' as const }))]);
    }).catch(() => { if (active) setRelatedError(true); });
    return () => { active = false; };
  }, [linkOpen]);

  useEffect(() => {
    const bitmap = cropImage?.bitmap;
    return () => bitmap?.close();
  }, [cropImage]);

  useEffect(() => {
    const bitmap = cropImage?.bitmap;
    const canvas = preview;
    if (!bitmap || !canvas) return;
    const width = Math.min(bitmap.width, bitmap.height * 16 / 9) / zoom;
    const height = width * 9 / 16;
    const context = canvas.getContext("2d");
    context?.clearRect(0, 0, canvas.width, canvas.height);
    context?.drawImage(bitmap, (bitmap.width - width) * cropX / 100,
      (bitmap.height - height) * cropY / 100, width, height, 0, 0, canvas.width, canvas.height);
  }, [cropImage, preview, zoom, cropX, cropY]);

  const applyLink = () => {
    const href = url.trim();
    if (href && !/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(href)) { setLinkError(true); return; }
    if (href && editor?.state.selection.empty && linkText) editor.chain().focus().insertContent({ type: 'text', text: linkText, marks: [{ type: 'link', attrs: { href } }] }).run();
    else if (href) editor?.chain().focus().extendMarkRange("link").setLink({ href }).run();
    else editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
  };

  const openImageCrop = async (file?: File) => {
    if (!file) return;
    setMediaError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 12 * 1024 * 1024) {
      setMediaError("Ảnh gốc phải là JPG, PNG hoặc WebP và không quá 12 MB.");
      return;
    }
    setMediaBusy(true);
    try {
      const bitmap = await createImageBitmap(file);
      if (!editor || editor.isDestroyed) { bitmap.close(); return; }
      setZoom(1);
      setCropX(50);
      setCropY(50);
      setCropImage({ file, bitmap });
    } catch {
      setMediaError("Không đọc được ảnh. Vui lòng chọn tệp khác.");
    } finally {
      setMediaBusy(false);
    }
  };

  const insertImage = async (file?: File) => {
    if (!file) return;
    setMediaError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMediaError("Ảnh phải là JPG, PNG hoặc WebP và không quá 5MB."); return;
    }
    setMediaBusy(true);
    try {
      const body = new FormData();
      body.append("file", file, file.name);
      const uploaded = await apiClient.post<{ url: string }>("/admin/media/image", body, {
        headers: { "Content-Type": undefined }, transformRequest: [(data) => data],
      });
      editor?.chain().focus().insertContent({ type: "embeddedImage", attrs: { src: uploaded.data.url, alt: file.name } }).run();
    } catch {
      setMediaError("Không upload được ảnh. Kiểm tra kết nối và Vercel Blob.");
    } finally { setMediaBusy(false); }
  };

  const applyImageCrop = async () => {
    const canvas = preview;
    if (!cropImage || !canvas || mediaBusy) return;
    setMediaBusy(true);
    try {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/webp", 0.86));
      if (!blob || blob.type !== "image/webp") throw new Error("Image conversion failed");
      const name = cropImage.file.name.replace(/\.[^.]+$/, "") + "-16x9.webp";
      setCropImage(null);
      await insertImage(new File([blob], name, { type: blob.type }));
    } catch {
      setMediaError("Không thể cắt ảnh. Vui lòng thử lại.");
    } finally {
      setMediaBusy(false);
    }
  };

  const insertVideo = () => {
    const source = videoUrl.trim();
    try {
      const parsed = new URL(source);
      if (parsed.protocol !== "https:" || !/\\.(mp4|webm|ogg)$/i.test(parsed.pathname)) throw Error("invalid");
      editor?.chain().focus().insertContent({ type: "embeddedVideo", attrs: { src: source } }).run();
      setVideoOpen(false); setVideoUrl(""); setMediaError("");
    } catch {
      setMediaError("Video phải là đường dẫn HTTPS trực tiếp đến tệp .mp4, .webm hoặc .ogg.");
    }
  };

  const actions = [
    { label: "Đậm", active: editor?.isActive("bold"), run: () => editor?.chain().focus().toggleBold().run() },
    { label: "Nghiêng", active: editor?.isActive("italic"), run: () => editor?.chain().focus().toggleItalic().run() },
    { label: "Gạch chân", active: editor?.isActive("underline"), run: () => editor?.chain().focus().toggleUnderline().run() },
    { label: "H2", active: editor?.isActive("heading", { level: 2 }), run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "H3", active: editor?.isActive("heading", { level: 3 }), run: () => editor?.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Danh sách", active: editor?.isActive("bulletList"), run: () => editor?.chain().focus().toggleBulletList().run() },
    { label: "Đánh số", active: editor?.isActive("orderedList"), run: () => editor?.chain().focus().toggleOrderedList().run() },
    { label: "Trích dẫn", active: editor?.isActive("blockquote"), run: () => editor?.chain().focus().toggleBlockquote().run() },
    { label: "Liên kết", active: editor?.isActive("link"), run: () => { setUrl(editor?.getAttributes("link").href || ""); setLinkError(false); setLinkText(""); setLinkOpen(true); } },
    { label: "Bỏ liên kết", run: () => editor?.chain().focus().unsetLink().run() },
    { label: "Hoàn tác", run: () => editor?.chain().focus().undo().run() },
    { label: "Làm lại", run: () => editor?.chain().focus().redo().run() },
  ];

  return <Box sx={{ mb: 2 }}>
    <Typography id={id} variant="body2" sx={{ mb: 1 }}>{label}</Typography>
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, "&:focus-within": { borderColor: "primary.main" } }}>
      <Stack direction="row" useFlexGap flexWrap="wrap" spacing={0.5} sx={{ p: 1, borderBottom: "1px solid", borderColor: "divider" }}>
        {actions.map((action) => <Button key={action.label} type="button" size="small" disabled={!editor} aria-pressed={Boolean(action.active)} variant={action.active ? "contained" : "text"} onMouseDown={(event) => event.preventDefault()} onClick={action.run}>{action.label}</Button>)}
        {enableMedia && <>
          <Button component="label" size="small" variant="outlined" disabled={!editor || mediaBusy}>
            {mediaBusy ? "Đang upload ảnh..." : "Chèn ảnh"}
            <input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { void openImageCrop(event.target.files?.[0]); event.target.value = ""; }} />
          </Button>
          <Button size="small" variant="outlined" disabled={!editor} onClick={() => { setMediaError(""); setVideoOpen(true); }}>Chèn video</Button>
        </>}
      </Stack>
      {mediaError && <Alert severity="error" sx={{ m: 1 }}>{mediaError}</Alert>}
      <Box sx={{ ...richTextStyles, "& .tiptap": { minHeight: 220, p: 2, outline: "none" } }}><EditorContent editor={editor} /></Box>
    </Box>
    {cropImage && <Dialog open onClose={() => { if (!mediaBusy) setCropImage(null); }} fullWidth maxWidth="sm">
      <DialogTitle>Chỉnh ảnh theo khung 16:9</DialogTitle>
      <DialogContent>
        <Box component="canvas" ref={setPreview} width={1280} height={720}
          role="img" aria-label="Xem trước vùng ảnh 16:9" sx={{ display: "block", width: "100%", height: "auto", bgcolor: "action.hover" }} />
        <Typography sx={{ mt: 2 }}>Thu phóng</Typography>
        <Slider aria-label="Thu phóng" min={1} max={3} step={0.05} value={zoom} onChange={(_, v) => setZoom(v as number)} />
        <Typography>Căn ngang</Typography>
        <Slider aria-label="Căn ngang" value={cropX} onChange={(_, v) => setCropX(v as number)} />
        <Typography>Căn dọc</Typography>
        <Slider aria-label="Căn dọc" value={cropY} onChange={(_, v) => setCropY(v as number)} />
        {mediaError && <Alert severity="error">{mediaError}</Alert>}
      </DialogContent>
      <DialogActions sx={{ flexWrap: "wrap" }}>
        <Button type="button" disabled={mediaBusy} onClick={() => setCropImage(null)}>Hủy</Button>
        <Button type="button" disabled={mediaBusy || cropImage.file.size > 5 * 1024 * 1024}
          onClick={() => { const file = cropImage.file; setCropImage(null); void insertImage(file); }}>Giữ ảnh gốc</Button>
        <Button type="button" variant="contained" disabled={mediaBusy} onClick={() => void applyImageCrop()}>Chèn ảnh 16:9</Button>
      </DialogActions>
    </Dialog>}
    <Dialog open={videoOpen} onClose={() => setVideoOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Chèn video vào nội dung</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Dùng link HTTPS trực tiếp đến tệp video đã lưu trên Vercel Blob hoặc CDN, không dùng đường dẫn YouTube dạng watch.</Typography>
        <TextField fullWidth label="Video URL (.mp4, .webm, .ogg)" value={videoUrl} onChange={event => setVideoUrl(event.target.value)} sx={{ mt: 1 }} />
        {mediaError && <Alert severity="error" sx={{ mt: 1 }}>{mediaError}</Alert>}
      </DialogContent>
      <DialogActions><Button onClick={() => setVideoOpen(false)}>Hủy</Button><Button onClick={insertVideo} variant="contained">Chèn video</Button></DialogActions>
    </Dialog>
    <Dialog open={linkOpen} onClose={() => setLinkOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Chèn / sửa liên kết</DialogTitle>
      <DialogContent>
        <Autocomplete options={related.filter(item => item.slug)} getOptionLabel={item => `${item.kind === 'products' ? 'Sản phẩm' : 'Bài viết'}: ${item.name || item.title}`} isOptionEqualToValue={(a, b) => a.id === b.id && a.kind === b.kind} onChange={(_, item) => { if (item) { setUrl(contentPath(item, item.kind)); setLinkText(item.name || item.title || ''); setLinkError(false); } }} renderInput={params => <TextField {...params} label="Chọn sản phẩm / bài viết liên quan" sx={{ mt: 1, mb: 2 }} />} />
        {relatedError && <Alert severity="warning">Không tải được danh sách liên quan. Bạn vẫn có thể nhập liên kết bên dưới.</Alert>}
        <TextField fullWidth label="Văn bản liên kết (khi chưa bôi đen nội dung)" value={linkText} onChange={event => setLinkText(event.target.value)} sx={{ mb: 2 }} />
        <TextField autoFocus fullWidth label="Địa chỉ liên kết" value={url} onChange={(event) => { setUrl(event.target.value); setLinkError(false); }} error={linkError} helperText={linkError ? "Dùng https://, http://, mailto:, tel:, / hoặc #." : "Để trống để bỏ liên kết."} sx={{ mt: 1 }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); applyLink(); } }} /></DialogContent>
      <DialogActions><Button onClick={() => setLinkOpen(false)}>Hủy</Button><Button onClick={applyLink}>Áp dụng</Button></DialogActions>
    </Dialog>
  </Box>;
}
