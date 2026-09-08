"use client";

import { useEffect, useId, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { richTextHtml, richTextStyles } from "@/lib/rich-text";

export default function RichTextEditor({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const id = useId();
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [linkError, setLinkError] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false } })],
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

  const applyLink = () => {
    const href = url.trim();
    if (href && !/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(href)) { setLinkError(true); return; }
    if (href) editor?.chain().focus().extendMarkRange("link").setLink({ href }).run();
    else editor?.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
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
    { label: "Liên kết", active: editor?.isActive("link"), run: () => { setUrl(editor?.getAttributes("link").href || ""); setLinkError(false); setLinkOpen(true); } },
    { label: "Bỏ liên kết", run: () => editor?.chain().focus().unsetLink().run() },
    { label: "Hoàn tác", run: () => editor?.chain().focus().undo().run() },
    { label: "Làm lại", run: () => editor?.chain().focus().redo().run() },
  ];

  return <Box sx={{ mb: 2 }}>
    <Typography id={id} variant="body2" sx={{ mb: 1 }}>{label}</Typography>
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1, "&:focus-within": { borderColor: "primary.main" } }}>
      <Stack direction="row" useFlexGap flexWrap="wrap" spacing={0.5} sx={{ p: 1, borderBottom: "1px solid", borderColor: "divider" }}>
        {actions.map((action) => <Button key={action.label} type="button" size="small" disabled={!editor} aria-pressed={Boolean(action.active)} variant={action.active ? "contained" : "text"} onMouseDown={(event) => event.preventDefault()} onClick={action.run}>{action.label}</Button>)}
      </Stack>
      <Box sx={{ ...richTextStyles, "& .tiptap": { minHeight: 220, p: 2, outline: "none" } }}><EditorContent editor={editor} /></Box>
    </Box>
    <Dialog open={linkOpen} onClose={() => setLinkOpen(false)} fullWidth maxWidth="sm">
      <DialogTitle>Chèn / sửa liên kết</DialogTitle>
      <DialogContent><TextField autoFocus fullWidth label="Địa chỉ liên kết" value={url} onChange={(event) => { setUrl(event.target.value); setLinkError(false); }} error={linkError} helperText={linkError ? "Dùng https://, http://, mailto:, tel:, / hoặc #." : "Để trống để bỏ liên kết."} sx={{ mt: 1 }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); applyLink(); } }} /></DialogContent>
      <DialogActions><Button onClick={() => setLinkOpen(false)}>Hủy</Button><Button onClick={applyLink}>Áp dụng</Button></DialogActions>
    </Dialog>
  </Box>;
}
