"use client";
import { productFallbackImage, productSeoDescription } from "@/lib/product-content";

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
  Tabs,
  Tab,
  MenuItem,
  Pagination,
  InputAdornment,
  Stack,
  Drawer,
  IconButton,
  Divider,
  FormControlLabel,
  Radio,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import { Suspense, useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { ProductImage, useStoreWatermark } from "@/components/ProductImage";
import { productsAPI, clientsAPI, categoriesAPI, Product, ProductCategory } from "@/lib/api-client";
import { useCartStore } from "@/store/cart";

function ProductsContent({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const pageSize = 9;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const searchParams = useSearchParams();
  const condition = searchParams.get("condition") || undefined;
  const categoryFromUrl = searchParams.get("category") || "";
  const watermark = useStoreWatermark();

  useEffect(() => { categoriesAPI.getAll().then(res=>setCategories(res.data)).catch(()=>undefined); }, []);
  useEffect(() => { setCategoryId(categoryFromUrl); }, [categoryFromUrl]);

  useEffect(() => {
    productsAPI
      .getAll(condition, categoryId || undefined)
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load products");
        setLoading(false);
      });
  }, [condition, categoryId]);

  const visibleProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const filtered = products.filter(product => !normalized || [product.name, product.sku, product.brand, product.size, product.category?.name].filter(Boolean).some(value => String(value).toLowerCase().includes(normalized)));
    return [...filtered].sort((a,b) => {
      if(sort==="price-asc") return (a.sellingPrice ?? Number.MAX_SAFE_INTEGER) - (b.sellingPrice ?? Number.MAX_SAFE_INTEGER);
      if(sort==="price-desc") return (b.sellingPrice ?? -1) - (a.sellingPrice ?? -1);
      if(sort==="name") return a.name.localeCompare(b.name, "vi");
      return 0;
    });
  }, [products, query, sort]);
  const pageCount = Math.max(1, Math.ceil(visibleProducts.length / pageSize));
  const pagedProducts = visibleProducts.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [categoryId, query, sort]);

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
        <Typography sx={{ fontSize: "1.1rem", letterSpacing: ".16em", fontWeight: 800, color: "secondary.main", mb: 1 }}>DANH MỤC SẢN PHẨM</Typography>
        <Typography component="h1" variant="h2" sx={{ mb: 1 }}>Thiết bị sẵn sàng cho mọi ca làm việc.</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 720, fontSize: { xs: "1rem", md: "1.15rem" }, lineHeight: 1.75, mb: 6 }}>Lựa chọn lốp và mâm phù hợp với tải trọng, môi trường và nhịp vận hành của đội xe.</Typography>

        <Box component="section" aria-label="Danh mục sản phẩm" sx={{ mb: 3 }}>
          {categories.length > 0 && <Tabs value={categoryId} onChange={(_,value)=>setCategoryId(value)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom:"1px solid", borderColor:"divider", "& .MuiTab-root":{fontWeight:800,fontSize:{xs:".85rem",md:"1rem"},px:{xs:2,md:3}} }}>
            <Tab value="" label="Tất cả" />
            {categories.map(category=><Tab key={category.id} value={category.id} label={category.name}/>)}
          </Tabs>}
          <Stack direction={{xs:"column",sm:"row"}} spacing={1.5} sx={{mt:2}}>
            <TextField fullWidth size="small" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm tên, SKU, thương hiệu, kích thước..." InputProps={{startAdornment:<InputAdornment position="start"><SearchIcon/></InputAdornment>}}/>
            <Button variant="outlined" startIcon={<TuneIcon/>} onClick={()=>setFilterOpen(true)} sx={{minWidth:140}}>Bộ lọc</Button>
            <TextField select size="small" value={sort} onChange={e=>setSort(e.target.value)} sx={{minWidth:190}}>
              <MenuItem value="newest">Mới nhất</MenuItem><MenuItem value="name">Tên A–Z</MenuItem><MenuItem value="price-asc">Giá thấp → cao</MenuItem><MenuItem value="price-desc">Giá cao → thấp</MenuItem>
            </TextField>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{mt:1.5}}>{visibleProducts.length} sản phẩm phù hợp</Typography>
        </Box>
        <Drawer anchor="left" open={filterOpen} onClose={()=>setFilterOpen(false)} PaperProps={{sx:{width:{xs:"92vw",sm:430},p:{xs:2.5,sm:3.5}}}}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" fontWeight={800}>Bộ lọc sản phẩm</Typography>
            <IconButton aria-label="Đóng bộ lọc" onClick={()=>setFilterOpen(false)}><CloseIcon/></IconButton>
          </Stack>
          <Divider sx={{my:2}}/>
          <Typography variant="h6" fontWeight={800} sx={{mb:1.5}}>Danh mục</Typography>
          <Box sx={{display:"flex",flexWrap:"wrap",gap:1}}>
            {[{id:"",name:"Tất cả"},...categories].map(category=>{
              const selected=categoryId===category.id;
              return <Button key={category.id || "all"} size="small" variant={selected?"contained":"outlined"} onClick={()=>setCategoryId(category.id)} sx={{borderRadius:99,textTransform:"none",px:2}}>{category.name}</Button>;
            })}
          </Box>
          <Divider sx={{my:3}}/>
          <Typography variant="h6" fontWeight={800} sx={{mb:1}}>Tình trạng</Typography>
          <Stack>
            <FormControlLabel control={<Radio checked={!condition} />} label="Tất cả" onClick={()=>{ const url=new URL(window.location.href);url.searchParams.delete("condition");window.history.replaceState(null,"",url);window.location.reload(); }}/>
            <FormControlLabel control={<Radio checked={condition==="NEW" || condition==="NEW_100"} />} label="Mới" onClick={()=>{ const url=new URL(window.location.href);url.searchParams.set("condition","NEW");window.location.href=url.toString(); }}/>
            <FormControlLabel control={<Radio checked={condition==="USED"} />} label="Đã qua sử dụng" onClick={()=>{ const url=new URL(window.location.href);url.searchParams.set("condition","USED");window.location.href=url.toString(); }}/>
          </Stack>
          <Divider sx={{my:3}}/>
          <Typography variant="h6" fontWeight={800} sx={{mb:1.5}}>Sắp xếp</Typography>
          <TextField select fullWidth size="small" value={sort} onChange={e=>setSort(e.target.value)}>
            <MenuItem value="newest">Mới nhất</MenuItem><MenuItem value="name">Tên A–Z</MenuItem><MenuItem value="price-asc">Giá thấp → cao</MenuItem><MenuItem value="price-desc">Giá cao → thấp</MenuItem>
          </TextField>
          <Button fullWidth size="large" variant="contained" onClick={()=>setFilterOpen(false)} sx={{mt:4,borderRadius:99}}>Xem {visibleProducts.length} sản phẩm</Button>
        </Drawer>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {pagedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "transparent", "&:hover img": { transform: "scale(1.035)" } }}>
                <ProductImage src={product.imageUrl} alt={product.seo?.imageAlt || `${product.name}${product.size ? ` ${product.size}` : ""}`} fallbackSrc={productFallbackImage(product)} watermark={watermark} imageSx={{ height: { xs: 280, md: 350 } }} />
                <CardContent sx={{ flexGrow: 1, px: 0, pt: 2.25, pb: 1 }}>
                  <Typography component="h2" variant="h5">{product.name}</Typography>
                  <Chip
                    size="small"
                    sx={{ mt: 1 }}
                    color={product.condition === "USED" ? "warning" : "success"}
                    label={product.condition === "USED" ? "CŨ / LƯỚT" : "MỚI 100%"}
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ maxHeight: "5.5rem", overflow: "hidden", textOverflow: "ellipsis", mt: 1, lineHeight: 1.6 }}>
                    {productSeoDescription(product)}
                  </Typography>
                  <Typography variant="body1" sx={{ marginTop: "1rem", fontWeight: 700 }}>
                    {product.sellingPrice ? `${product.sellingPrice.toLocaleString()} ₫` : "Liên hệ"}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 0, pb: 0, gap: 1 }}>
                  <Button component={NextLink} href={`/products/${product.slug || product.id}`} size="small" variant="text" sx={{ px: 0, color: "#1a1a1a", textDecoration: "underline", textUnderlineOffset: "4px", marginRight: "auto" }}>
                    Xem chi tiết
                  </Button>
                  {product.sellingPrice ? (
                    <Button
                      variant="contained"
                      startIcon={<ShoppingCartIcon />}
                      onClick={() => addItem(product, 1)}
                    >
                      Thêm vào giỏ
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
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
        {!loading && visibleProducts.length === 0 && <Typography sx={{py:6,textAlign:"center"}}>Không tìm thấy sản phẩm phù hợp.</Typography>}
        {pageCount > 1 && <Box component="nav" aria-label="Phân trang sản phẩm" sx={{display:"flex",justifyContent:"center",mt:5}}><Pagination page={page} count={pageCount} onChange={(_,value)=>setPage(value)} size="large"/></Box>}
      </Container></Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <Box sx={{ padding: "2rem" }}>
          <Typography component="h2" variant="h6" sx={{ marginBottom: "1rem" }}>
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

export default function ProductsPage({ initialProducts }: { initialProducts: Product[] }) {
  return <Suspense fallback={<Box sx={{ display: "grid", minHeight: "50vh", placeItems: "center" }}><CircularProgress /></Box>}><ProductsContent initialProducts={initialProducts} /></Suspense>;
}
