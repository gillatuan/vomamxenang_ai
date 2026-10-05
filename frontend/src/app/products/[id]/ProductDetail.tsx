"use client";
import RichTextContent from "@/components/RichTextContent";
import { productFallbackImage, productSeoDescription } from "@/lib/product-content";

import { Box, Button, Card, CardContent, Chip, Container, Grid, IconButton, Stack, Typography } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PhoneIcon from "@mui/icons-material/Phone";
import ChatIcon from "@mui/icons-material/Chat";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import { QuoteRequestDialog } from "@/components/QuoteRequestDialog";
import { useState } from "react";
import { Footer } from "@/components/Footer";
import { ProductImage, useStoreWatermark } from "@/components/ProductImage";
import { PublicHeader } from "@/components/PublicHeader";
import { Product } from "@/lib/api-client";
import { useCartStore } from "@/store/cart";

export default function ProductDetailPage({ product, related, breadcrumbs }: { product: Product; related?: React.ReactNode; breadcrumbs?: React.ReactNode }) {
  const [favourite, setFavourite] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const phone = "0913600210";
  const zaloUrl = `https://zalo.me/${phone}`;
  const addItem = useCartStore((state) => state.addItem);
  const watermark = useStoreWatermark();

  const specifications = Array.isArray(product.specifications) ? product.specifications : [];
  const highlights = Array.isArray(product.highlights) ? product.highlights : [];
  const applications = Array.isArray(product.applications) ? product.applications : [];
  const stockQuantity = (product.stocks || []).reduce((sum, row) => sum + Math.max(0, row.quantity || 0), 0);
  const stockState = stockQuantity <= 0
    ? { label: "Liên hệ kiểm tra hàng", color: "default" as const, detail: "Tồn kho hiện tại chưa sẵn sàng. Hãy liên hệ để kiểm tra hàng hoặc thời gian nhập." }
    : stockQuantity <= (product.minStock ?? 5)
      ? { label: "Sắp hết hàng", color: "warning" as const, detail: "Số lượng khả dụng đang thấp. Vui lòng xác nhận trước khi đặt." }
      : { label: "Có hàng", color: "success" as const, detail: "Đang ghi nhận tồn kho khả dụng. Số lượng cuối cùng được xác nhận khi đặt hàng." };
  const tireTypeLabel = product.tireType === "SOLID" ? "Vỏ đặc" : product.tireType === "PNEUMATIC" ? "Vỏ hơi" : product.tireType === "NON_MARKING" ? "Non-marking" : product.tireType;

  return <>
    <PublicHeader />
    <Container sx={{ py: { xs: 3, md: 6 } }}>
      {breadcrumbs}
      <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
        <Box sx={{ width: { xs: "100%", md: "48%" }, borderRadius: 2, overflow: "hidden" }}><ProductImage priority src={product.imageUrl} alt={product.seo?.imageAlt || `${product.name}${product.size ? ` ${product.size}` : ""}`} fallbackSrc={productFallbackImage(product)} watermark={watermark} imageSx={{ height: { xs: 300, md: 420 } }} /></Box>
        <Box sx={{ flex: 1 }}>
          <Chip color={product.condition === "USED" ? "warning" : "success"} label={product.condition === "USED" ? "CŨ / LƯỚT" : "MỚI 100%"} />
          <Typography component="h1" variant="h2" sx={{ mt: 1.5 }}>{product.name}</Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>{productSeoDescription(product)}</Typography>
          <Stack spacing={1} sx={{ my: 3 }}>
            {product.brand && <Typography>Thương hiệu: <b>{product.brand}</b></Typography>}
            {product.size && <Typography>Kích thước: <b>{product.size}</b></Typography>}
            {tireTypeLabel && <Typography>Loại vỏ: <b>{tireTypeLabel}</b></Typography>}
            <Stack direction="row" spacing={1} alignItems="center"><Chip size="small" color={stockState.color} label={stockState.label} /><Typography variant="body2" color="text.secondary">{stockState.detail}</Typography></Stack>
          </Stack>
          <Typography component="p" variant="h5" color="primary" fontWeight={700}>{product.sellingPrice ? `${product.sellingPrice.toLocaleString()} ₫` : "Liên hệ báo giá"}</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 3 }}>
            <Button component="a" href={`tel:${phone}`} variant="contained" startIcon={<PhoneIcon />}>Gọi ngay</Button>
            <Button component="a" href={zaloUrl} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<ChatIcon />}>Chat Zalo</Button>
            <Button variant="outlined" startIcon={<RequestQuoteIcon />} onClick={() => setQuoteOpen(true)}>Yêu cầu báo giá</Button>
            <Button variant="text" startIcon={<ShoppingCartIcon />} disabled={!product.sellingPrice} onClick={() => addItem(product, 1)}>Thêm vào giỏ</Button>
            <IconButton aria-label="Lưu yêu thích" color={favourite ? "error" : "default"} onClick={() => setFavourite(!favourite)}>{favourite ? <FavoriteIcon /> : <FavoriteBorderIcon />}</IconButton>
          </Stack>
        </Box>
      </Stack>
      {product.size && <Card variant="outlined" sx={{ mt: 4 }}><CardContent>
        <Typography component="h2" variant="h4" fontWeight={800}>Vỏ xe nâng {product.size}: thông tin cần biết trước khi đặt</Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.8 }}>Sản phẩm này có kích thước <b>{product.size}</b>{product.brand ? <> và thương hiệu <b>{product.brand}</b></> : null}. Hãy đối chiếu chính xác thông số ghi trên vỏ hiện tại và cấu hình mâm trước khi thay. Cùng một model xe nâng có thể có cấu hình bánh khác nhau.</Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={4}><Typography variant="body2" color="text.secondary">Kích thước</Typography><Typography fontWeight={800}>{product.size}</Typography></Grid>
          {tireTypeLabel && <Grid item xs={12} sm={4}><Typography variant="body2" color="text.secondary">Loại</Typography><Typography fontWeight={800}>{tireTypeLabel}</Typography></Grid>}
          <Grid item xs={12} sm={4}><Typography variant="body2" color="text.secondary">Tình trạng hàng</Typography><Typography fontWeight={800}>{stockState.label}</Typography></Grid>
        </Grid>
      </CardContent></Card>}
      {(highlights.length > 0 || specifications.length > 0 || applications.length > 0) && <Grid container spacing={3} sx={{ mt: 2 }}>
        {highlights.length > 0 && <Grid item xs={12} md={4}><Card variant="outlined" sx={{ height: "100%" }}><CardContent>
          <Typography component="h2" variant="h6" fontWeight={700} gutterBottom>Điểm đáng chú ý</Typography>
          <Stack component="ul" spacing={1} sx={{ pl: 2, my: 0 }}>{highlights.map((item) => <Typography component="li" key={item} color="text.secondary">{item}</Typography>)}</Stack>
        </CardContent></Card></Grid>}
        {specifications.length > 0 && <Grid item xs={12} md={4}><Card variant="outlined" sx={{ height: "100%" }}><CardContent>
          <Typography component="h2" variant="h6" fontWeight={700} gutterBottom>Thông số cần đối chiếu</Typography>
          <Stack spacing={1.25}>{specifications.map((item) => <Box key={item.label}><Typography variant="body2" color="text.secondary">{item.label}</Typography><Typography fontWeight={600}>{item.value}</Typography></Box>)}</Stack>
        </CardContent></Card></Grid>}
        {applications.length > 0 && <Grid item xs={12} md={4}><Card variant="outlined" sx={{ height: "100%" }}><CardContent>
          <Typography component="h2" variant="h6" fontWeight={700} gutterBottom>Ứng dụng phù hợp</Typography>
          <Stack component="ul" spacing={1} sx={{ pl: 2, my: 0 }}>{applications.map((item) => <Typography component="li" key={item} color="text.secondary">{item}</Typography>)}</Stack>
        </CardContent></Card></Grid>}
      </Grid>}
      {product.description && <Card variant="outlined" sx={{ mt: 3 }}><CardContent>
        <Typography component="h2" variant="h6" fontWeight={700} gutterBottom>Tư vấn lựa chọn & lắp đặt</Typography>
        <RichTextContent value={product.description} />
      </CardContent></Card>}
      <Card variant="outlined" sx={{ mt: 3 }}><CardContent>
        <Typography component="h2" variant="h5" fontWeight={800}>Cần xác nhận sản phẩm này có phù hợp?</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>Chụp thông số trên hông vỏ và ảnh bánh/mâm hiện tại rồi gửi cùng yêu cầu báo giá. Chúng tôi sẽ đối chiếu trước khi xác nhận sản phẩm hoặc dịch vụ ép/thay vỏ.</Typography>
        <Button variant="contained" startIcon={<RequestQuoteIcon />} sx={{ mt: 2 }} onClick={() => setQuoteOpen(true)}>Gửi ảnh & yêu cầu báo giá</Button>
      </CardContent></Card>
      {related}
    </Container>
    <QuoteRequestDialog open={quoteOpen} onClose={() => setQuoteOpen(false)} product={product} />
    <Footer />
  </>;
}
