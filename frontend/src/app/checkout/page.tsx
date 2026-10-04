"use client";

import { Alert, Box, Button, CircularProgress, Container, Step, StepLabel, Stepper, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { SeoBreadcrumbs } from "@/components/SeoBreadcrumbs";
import { ordersAPI } from "@/lib/api-client";
import { useCartStore } from "@/store/cart";

const steps = ["Xem lại giỏ hàng", "Giao hàng & giá khách hàng", "Thanh toán Stripe"];

export default function CheckoutPage() {
  const { items, total } = useCartStore();
  const [activeStep, setActiveStep] = useState(0);
  const [delivery, setDelivery] = useState({ name: "", phone: "", address: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const next = async () => {
    setError(null);
    if (activeStep === 0 && !items.length) return setError("Giỏ hàng đang trống.");
    if (activeStep === 1 && (!delivery.name || !delivery.phone || !delivery.address)) return setError("Vui lòng nhập đầy đủ thông tin giao hàng.");
    if (activeStep < 2) return setActiveStep(activeStep + 1);
    setLoading(true);
    try {
      const response = await ordersAPI.createCheckoutSession(items.map((item) => ({ productId: item.id, quantity: item.quantity, price: item.sellingPrice || 0 })));
      window.location.href = response.data.url;
    } catch (cause: any) { setError(cause.response?.data?.message || "Không thể tạo phiên thanh toán."); } finally { setLoading(false); }
  };
  return <><PublicHeader /><Container maxWidth="md" sx={{ py: 5 }}>
    <SeoBreadcrumbs items={[{ name: "Trang chủ", path: "/" }, { name: "Sản phẩm", path: "/products" }, { name: "Thanh toán", path: "/checkout" }]} />
    <Typography variant="h4" fontWeight={700} gutterBottom>Thanh toán</Typography>
    <Stepper activeStep={activeStep} alternativeLabel sx={{ my: 4 }}>{steps.map((step) => <Step key={step}><StepLabel>{step}</StepLabel></Step>)}</Stepper>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <Box sx={{ minHeight: 220 }}>
      {activeStep === 0 && <>{items.map((item) => <Box key={item.id} sx={{ display: "flex", justifyContent: "space-between", py: 1, borderBottom: "1px solid", borderColor: "divider" }}><span>{item.name} × {item.quantity}</span><b>{((item.sellingPrice || 0) * item.quantity).toLocaleString()} ₫</b></Box>)}<Typography variant="h6" sx={{ mt: 2 }}>Tổng cộng: {total().toLocaleString()} ₫</Typography></>}
      {activeStep === 1 && <Box sx={{ display: "grid", gap: 2 }}><TextField required label="Người nhận" value={delivery.name} onChange={(e) => setDelivery({ ...delivery, name: e.target.value })} /><TextField required label="Số điện thoại" value={delivery.phone} onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })} /><TextField required label="Địa chỉ giao hàng" multiline minRows={2} value={delivery.address} onChange={(e) => setDelivery({ ...delivery, address: e.target.value })} /></Box>}
      {activeStep === 2 && <Alert severity="info">Bạn sẽ được chuyển đến Stripe để thanh toán an toàn. Hãy kiểm tra lại tổng tiền trước khi tiếp tục.</Alert>}
    </Box>
    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}><Button disabled={activeStep === 0 || loading} onClick={() => setActiveStep(activeStep - 1)}>Quay lại</Button><Button variant="contained" disabled={loading} onClick={next}>{loading ? <CircularProgress size={20} color="inherit" /> : activeStep === 2 ? "Thanh toán với Stripe" : "Tiếp tục"}</Button></Box>
  </Container><Footer /></>;
}
