"use client";
import RichTextContent from "@/components/RichTextContent";
import { productFallbackImage, productSeoDescription } from "@/lib/product-content";

import { Box, Button, Card, CardContent, Chip, Container, Grid, IconButton, Stack, Typography } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useState } from "react";
import { Footer } from "@/components/Footer";
import { ProductImage, useStoreWatermark } from "@/components/ProductImage";
import { PublicHeader } from "@/components/PublicHeader";
import { Product } from "@/lib/api-client";
import { useCartStore } from "@/store/cart";

export default function ProductDetailPage({ product, related, breadcrumbs }: { product: Product; related?: React.ReactNode; breadcrumbs?: React.ReactNode }) {
  const [favourite, setFavourite] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const watermark = useStoreWatermark();

  const specifications = Array.isArray(product.specifications) ? product.specifications : [];
  const highlights = Array.isArray(product.highlights) ? product.highlights : [];
  const applications = Array.isArray(product.applications) ? product.applications : [];

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
            <Typography variant="body2" color="text.secondary">Tình trạng tồn kho được xác nhận khi đặt hàng.</Typography>
          </Stack>
          <Typography component="p" variant="h5" color="primary" fontWeight={700}>{product.sellingPrice ? `${product.sellingPrice.toLocaleString()} ₫` : "Liên hệ báo giá"}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
            <Button variant="contained" startIcon={<ShoppingCartIcon />} disabled={!product.sellingPrice} onClick={() => addItem(product, 1)}>Thêm vào giỏ</Button>
            <IconButton aria-label="Lưu yêu thích" color={favourite ? "error" : "default"} onClick={() => setFavourite(!favourite)}>{favourite ? <FavoriteIcon /> : <FavoriteBorderIcon />}</IconButton>
          </Stack>
        </Box>
      </Stack>
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
      {related}
    </Container>
    <Footer />
  </>;
}
