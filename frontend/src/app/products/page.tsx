"use client";

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  TextField,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Suspense, useEffect, useState } from "react";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { ProductImage, useStoreWatermark } from "@/components/ProductImage";
import { productsAPI, clientsAPI, Product } from "@/lib/api-client";
import { useCartStore } from "@/store/cart";

function ProductsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const searchParams = useSearchParams();
  const condition = searchParams.get("condition") || undefined;
  const watermark = useStoreWatermark();

  useEffect(() => {
    productsAPI
      .getAll(condition)
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load products");
        setLoading(false);
      });
  }, [condition]);

  const handleQuoteClick = (product: Product) => {
    setSelectedProduct(product);
    setOpenDialog(true);
  };

  const handleSubmitQuote = async () => {
    if (!selectedProduct) return;
    setSubmitting(true);

    try {
      await clientsAPI.create({
        name: formData.name,
        email: formData.phone,
        phone: formData.phone,
        notes: `Yêu cầu báo giá sản phẩm: ${selectedProduct.name}\n${formData.notes}`,
      });
      alert("Gửi yêu cầu báo giá thành công!");
      setOpenDialog(false);
      setFormData({ name: "", phone: "", notes: "" });
    } catch (err) {
      alert("Error submitting quote request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PublicHeader />
      <Box component="main"><Container maxWidth={false} sx={{ maxWidth: 1440, pt: { xs: 6, md: 10 }, pb: { xs: 4, md: 6 } }}>
        <Typography sx={{ fontSize: ".68rem", letterSpacing: ".16em", fontWeight: 800, color: "secondary.main", mb: 1 }}>DANH MỤC SẢN PHẨM</Typography>
        <Typography component="h1" variant="h2" sx={{ mb: 1 }}>Thiết bị sẵn sàng cho mọi ca làm việc.</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 570, lineHeight: 1.7, mb: 5 }}>Lựa chọn lốp và mâm phù hợp với tải trọng, môi trường và nhịp vận hành của đội xe.</Typography>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "transparent", "&:hover img": { transform: "scale(1.035)" } }}>
                <ProductImage src={product.imageUrl || "/images/products/solid-warehouse.png"} alt={product.name} watermark={watermark} imageSx={{ height: { xs: 260, md: 330 } }} />
                <CardContent sx={{ flexGrow: 1, px: 0, pt: 2.25, pb: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>{product.name}</Typography>
                  <Chip
                    size="small"
                    sx={{ mt: 1 }}
                    color={product.condition === "USED" ? "warning" : "success"}
                    label={product.condition === "USED" ? "CŨ / LƯỚT" : "MỚI 100%"}
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1, lineHeight: 1.6 }}>
                    {product.description}
                  </Typography>
                  <Typography variant="body1" sx={{ marginTop: "1rem", fontWeight: 700 }}>
                    {product.sellingPrice ? `${product.sellingPrice.toLocaleString()} ₫` : "Liên hệ"}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 0, pb: 0, gap: 1 }}>
                  <Button component={NextLink} href={`/products/${product.id}`} size="small" variant="text" sx={{ px: 0, color: "#1a1a1a", textDecoration: "underline", textUnderlineOffset: "4px" }}>
                    Xem chi tiết
                  </Button>
                  {product.sellingPrice ? (
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      fullWidth
                      onClick={() => addItem(product, 1)}
                    >
                      Thêm vào giỏ
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => handleQuoteClick(product)}
                    >
                      Nhận báo giá
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container></Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <Box sx={{ padding: "2rem" }}>
          <Typography variant="h6" sx={{ marginBottom: "1rem" }}>
            Yêu cầu báo giá: {selectedProduct?.name}
          </Typography>
          <TextField
            fullWidth
            label="Tên"
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Số điện thoại"
            margin="normal"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <TextField
            fullWidth
            label="Ghi chú"
            margin="normal"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
          <Box sx={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <Button variant="outlined" fullWidth onClick={() => setOpenDialog(false)}>
              Hủy
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmitQuote}
              disabled={submitting}
            >
              {submitting ? "Đang gửi..." : "Gửi"}
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Footer />
    </>
  );
}

export default function ProductsPage() {
  return <Suspense fallback={<Box sx={{ display: "grid", minHeight: "50vh", placeItems: "center" }}><CircularProgress /></Box>}><ProductsContent /></Suspense>;
}
