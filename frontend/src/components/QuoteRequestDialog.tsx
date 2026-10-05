"use client";
import { useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { quoteLeadsAPI, Product } from "@/lib/api-client";

export function QuoteRequestDialog({ open, onClose, product, context }: { open: boolean; onClose: () => void; product?: Product; context?: string }) {
  const [form, setForm] = useState({ name: "", phone: "", zalo: "", company: "", quantity: "1", forkliftModel: "", location: "", note: "", website: "" });
  const [image, setImage] = useState<File | null>(null);
  const [state, setState] = useState<"idle"|"sending"|"success"|"error">("idle");
  const change = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(v => ({ ...v, [key]: e.target.value }));
  const submit = async () => {
    if (!form.name.trim() || !form.phone.trim()) return setState("error");
    setState("sending");
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k,v]) => v && k !== "note" && data.append(k,v));
      if (form.note || context) data.append("note", [context, form.note].filter(Boolean).join(" — "));
      if (product?.id) data.append("productId", product.id);
      data.append("landingPage", window.location.pathname);
      if (image) data.append("image", image);
      await quoteLeadsAPI.create(data);
      setState("success");
    } catch { setState("error"); }
  };
  return <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle>Yêu cầu báo giá{product ? ` — ${product.name}` : ""}</DialogTitle>
    <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
      <Typography color="text.secondary">Để lại thông tin, chúng tôi sẽ liên hệ tư vấn và xác nhận phương án phù hợp.</Typography>
      {state === "success" && <Alert severity="success">Đã nhận yêu cầu. Chúng tôi sẽ liên hệ với bạn sớm.</Alert>}
      {state === "error" && <Alert severity="error">Vui lòng nhập tên, số điện thoại hợp lệ và thử lại.</Alert>}
      <TextField required label="Tên khách hàng" value={form.name} onChange={change("name")} inputProps={{ maxLength: 120 }} />
      <TextField required label="Số điện thoại" value={form.phone} onChange={change("phone")} inputProps={{ maxLength: 30 }} />
      <TextField label="Zalo (nếu khác SĐT)" value={form.zalo} onChange={change("zalo")} />
      <TextField label="Công ty" value={form.company} onChange={change("company")} />
      <TextField type="number" label="Số lượng" value={form.quantity} onChange={change("quantity")} inputProps={{ min: 1 }} />
      <TextField label="Hãng / model xe nâng" value={form.forkliftModel} onChange={change("forkliftModel")} />
      <TextField label="Khu vực / địa điểm" value={form.location} onChange={change("location")} />
      <TextField multiline minRows={3} label="Ghi chú" placeholder="Ví dụ: cần vỏ đặc, cần ép vỏ, thời gian cần hàng..." value={form.note} onChange={change("note")} />
      <Button component="label" variant="outlined" startIcon={<UploadFileIcon />}>Ảnh vỏ / mâm hiện tại<input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setImage(e.target.files?.[0] || null)} /></Button>
      {image && <Typography variant="caption">{image.name}</Typography>}
      <input aria-hidden tabIndex={-1} autoComplete="off" value={form.website} onChange={change("website")} style={{ position:"absolute", left:"-10000px" }} />
    </Stack></DialogContent>
    <DialogActions><Button onClick={onClose}>Đóng</Button><Button variant="contained" disabled={state==="sending"||state==="success"} onClick={submit}>{state==="sending" ? "Đang gửi..." : "Gửi yêu cầu"}</Button></DialogActions>
  </Dialog>;
}
