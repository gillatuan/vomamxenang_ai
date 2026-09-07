"use client";

import { Alert, Avatar, Box, Button, Card, CardContent, Chip, CircularProgress, Container, Divider, Grid, IconButton, Rating, Stack, TextField, Typography } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { ProductImage, useStoreWatermark } from "@/components/ProductImage";
import { PublicHeader } from "@/components/PublicHeader";
import { Product, productsAPI } from "@/lib/api-client";
import { useCartStore } from "@/store/cart";

type Comment = { name: string; rating: number; content: string };
const initialComments: Comment[] = [
  { name: "Anh Minh", rating: 5, content: "Hàng đúng mô tả, tư vấn rất kỹ." },
  { name: "Công ty An Phát", rating: 4, content: "Lốp chạy ổn định, sẽ tiếp tục ủng hộ." },
];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [favourite, setFavourite] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [rating, setRating] = useState<number | null>(5);
  const [content, setContent] = useState("");
  const addItem = useCartStore((state) => state.addItem);
  const watermark = useStoreWatermark();

  useEffect(() => {
    productsAPI.getOne(id).then((response) => setProduct(response.data)).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [id]);

  const submitComment = (event: FormEvent) => {
    event.preventDefault();
    if (!content.trim()) return;
    setComments((current) => [{ name: "Bạn", rating: rating || 1, content: content.trim() }, ...current]);
    setContent("");
  };

  if (loading) return <Box sx={{ display: "grid", placeItems: "center", minHeight: "60vh" }}><CircularProgress /></Box>;
  if (!product) return <><PublicHeader /><Container sx={{ py: 8 }}><Alert severity="error">Không tìm thấy sản phẩm.</Alert></Container></>;

  const specifications = Array.isArray(product.specifications) ? product.specifications : [];
  const highlights = Array.isArray(product.highlights) ? product.highlights : [];
  const applications = Array.isArray(product.applications) ? product.applications : [];

  return <>
    <PublicHeader />
    <Container sx={{ py: { xs: 3, md: 6 } }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={4}>
        <Box sx={{ width: { xs: "100%", md: "48%" }, borderRadius: 2, overflow: "hidden" }}><ProductImage src={product.imageUrl || "/images/products/solid-warehouse.png"} alt={product.name} watermark={watermark} imageSx={{ height: { xs: 300, md: 420 } }} /></Box>
        <Box sx={{ flex: 1 }}>
          <Chip color={product.condition === "USED" ? "warning" : "success"} label={product.condition === "USED" ? "CŨ / LƯỚT" : "MỚI 100%"} />
          <Typography variant="h4" fontWeight={700} sx={{ mt: 1 }}>{product.name}</Typography>
          <Typography color="text.secondary" sx={{ mt: 2 }}>{product.shortDescription || product.description || "Thông tin sản phẩm đang được cập nhật."}</Typography>
          <Stack spacing={1} sx={{ my: 3 }}>
            {product.brand && <Typography>Thương hiệu: <b>{product.brand}</b></Typography>}
            {product.size && <Typography>Kích thước: <b>{product.size}</b></Typography>}
            <Typography variant="body2" color="text.secondary">Tình trạng tồn kho được xác nhận khi đặt hàng.</Typography>
          </Stack>
          <Typography variant="h5" color="primary" fontWeight={700}>{product.sellingPrice ? `${product.sellingPrice.toLocaleString()} ₫` : "Liên hệ báo giá"}</Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
            <Button variant="contained" startIcon={<ShoppingCartIcon />} disabled={!product.sellingPrice} onClick={() => addItem(product, 1)}>Thêm vào giỏ</Button>
            <IconButton aria-label="Lưu yêu thích" color={favourite ? "error" : "default"} onClick={() => setFavourite(!favourite)}>{favourite ? <FavoriteIcon /> : <FavoriteBorderIcon />}</IconButton>
          </Stack>
        </Box>
      </Stack>
      {(highlights.length > 0 || specifications.length > 0 || applications.length > 0) && <Grid container spacing={3} sx={{ mt: 2 }}>
        {highlights.length > 0 && <Grid item xs={12} md={4}><Card variant="outlined" sx={{ height: "100%" }}><CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>Điểm đáng chú ý</Typography>
          <Stack component="ul" spacing={1} sx={{ pl: 2, my: 0 }}>{highlights.map((item) => <Typography component="li" key={item} color="text.secondary">{item}</Typography>)}</Stack>
        </CardContent></Card></Grid>}
        {specifications.length > 0 && <Grid item xs={12} md={4}><Card variant="outlined" sx={{ height: "100%" }}><CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>Thông số cần đối chiếu</Typography>
          <Stack spacing={1.25}>{specifications.map((item) => <Box key={item.label}><Typography variant="body2" color="text.secondary">{item.label}</Typography><Typography fontWeight={600}>{item.value}</Typography></Box>)}</Stack>
        </CardContent></Card></Grid>}
        {applications.length > 0 && <Grid item xs={12} md={4}><Card variant="outlined" sx={{ height: "100%" }}><CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>Ứng dụng phù hợp</Typography>
          <Stack component="ul" spacing={1} sx={{ pl: 2, my: 0 }}>{applications.map((item) => <Typography component="li" key={item} color="text.secondary">{item}</Typography>)}</Stack>
        </CardContent></Card></Grid>}
      </Grid>}
      {product.description && <Card variant="outlined" sx={{ mt: 3 }}><CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>Tư vấn lựa chọn & lắp đặt</Typography>
        <Typography color="text.secondary" sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>{product.description}</Typography>
      </CardContent></Card>}
      <Divider sx={{ my: 5 }} />
      <Typography variant="h5" fontWeight={700} gutterBottom>Đánh giá & bình luận</Typography>
      <Card component="form" onSubmit={submitComment} sx={{ mb: 3 }}><CardContent>
        <Rating value={rating} onChange={(_, value) => setRating(value)} />
        <TextField multiline minRows={3} fullWidth required label="Chia sẻ cảm nhận của bạn" value={content} onChange={(e) => setContent(e.target.value)} sx={{ my: 2 }} />
        <Button type="submit" variant="contained">Gửi bình luận</Button>
      </CardContent></Card>
      <Stack spacing={2}>{comments.map((comment, index) => <Card key={`${comment.name}-${index}`} variant="outlined"><CardContent><Stack direction="row" spacing={1} alignItems="center"><Avatar>{comment.name.slice(0, 1)}</Avatar><Box><Typography fontWeight={700}>{comment.name}</Typography><Rating value={comment.rating} readOnly size="small" /></Box></Stack><Typography sx={{ mt: 1 }}>{comment.content}</Typography></CardContent></Card>)}</Stack>
    </Container>
    <Footer />
  </>;
}
