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
      <Container sx={{ padding: "4rem 0" }}>
        <Typography variant="h4" sx={{ marginBottom: "2rem", fontWeight: "bold" }}>
          Sản phẩm
        </Typography>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={2}>
          {products.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                {product.imageUrl && (
                  <Box
                    component="img"
                    src={product.imageUrl}
                    alt={product.name}
                    sx={{ width: "100%", height: "200px", objectFit: "cover" }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{product.name}</Typography>
                  <Chip
                    size="small"
                    sx={{ mt: 1 }}
                    color={product.condition === "USED" ? "warning" : "success"}
                    label={product.condition === "USED" ? "CŨ / LƯỚT" : "MỚI 100%"}
                  />
                  <Typography variant="body2" color="textSecondary">
                    {product.description}
                  </Typography>
                  <Typography variant="body1" sx={{ marginTop: "1rem", fontWeight: "bold" }}>
                    {product.sellingPrice ? `${product.sellingPrice.toLocaleString()} ₫` : "Liên hệ"}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button component={NextLink} href={`/products/${product.id}`} size="small">
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
      </Container>

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
