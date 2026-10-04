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
  Slider,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import { Suspense, useEffect, useState } from "react";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { ProductImage, useStoreWatermark } from "@/components/ProductImage";
import { productsAPI, clientsAPI, categoriesAPI, Product } from "@/lib/api-client";
import { useCartStore } from "@/store/cart";

type ProductCategory = { id: string; name: string };

function ProductsContent({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [conditionFilter, setConditionFilter] = useState("");
  const [brandFilter,setBrandFilter]=useState(""); const [sizeFilter,setSizeFilter]=useState(""); const [tireTypeFilter,setTireTypeFilter]=useState(""); const [rimTypeFilter,setRimTypeFilter]=useState(""); const PRICE_MIN=0, PRICE_MAX=3000000, PRICE_STEP=50000;
  const [priceRange,setPriceRange]=useState<number[]>([PRICE_MIN,PRICE_MAX]);
  const [appliedPriceRange,setAppliedPriceRange]=useState<number[]>([PRICE_MIN,PRICE_MAX]);
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
  useEffect(() => { setConditionFilter(condition || ""); }, [condition]);
  useEffect(() => {
    if (categoryId === "category-tires") setRimTypeFilter("");
    else if (categoryId === "category-rims") setTireTypeFilter("");
    else { setTireTypeFilter(""); setRimTypeFilter(""); }
  }, [categoryId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      productsAPI.getAll({ condition: conditionFilter || undefined, categoryId: categoryId || undefined, q: query.trim() || undefined, sort, brand:brandFilter||undefined, size:sizeFilter||undefined, tireType:tireTypeFilter||undefined, rimType:rimTypeFilter||undefined, minPrice:appliedPriceRange[0]>PRICE_MIN?appliedPriceRange[0]:undefined, maxPrice:appliedPriceRange[1]<PRICE_MAX?appliedPriceRange[1]:undefined })
        .then(res => { setProducts(res.data); setLoading(false); })
        .catch(() => { setError("Không thể tải sản phẩm"); setLoading(false); });
    }, query ? 300 : 0);
    return () => window.clearTimeout(timer);
  }, [conditionFilter, categoryId, query, sort, brandFilter, sizeFilter, tireTypeFilter, rimTypeFilter, appliedPriceRange]);

  const visibleProducts = products;
  const pageCount = Math.max(1, Math.ceil(products.length / pageSize));
  const pagedProducts = products.slice((page - 1) * pageSize, page * pageSize);
  useEffect(() => { setPage(1); }, [categoryId, conditionFilter, query, sort, brandFilter, sizeFilter, tireTypeFilter, rimTypeFilter, appliedPriceRange]);

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
            <TextField fullWidth size="small" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm tên, SKU, thương hiệu, kích thước..." sx={{"& .MuiOutlinedInput-root":{height:48,borderRadius:2}}} InputProps={{startAdornment:<InputAdornment position="start"><SearchIcon/></InputAdornment>}}/>
            <Button variant="outlined" startIcon={<TuneIcon/>} onClick={()=>setFilterOpen(true)} sx={{height:48,minWidth:150,borderRadius:2,fontWeight:700}}>Bộ lọc</Button>
            <TextField select size="small" value={sort} onChange={e=>setSort(e.target.value)} sx={{minWidth:210,"& .MuiOutlinedInput-root":{height:48,borderRadius:2}}}>
              <MenuItem value="newest">Mới nhất</MenuItem><MenuItem value="name">Tên A–Z</MenuItem><MenuItem value="price-asc">Giá thấp → cao</MenuItem><MenuItem value="price-desc">Giá cao → thấp</MenuItem>
            </TextField>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{mt:1.5}}>{visibleProducts.length} sản phẩm phù hợp</Typography>
          {(categoryId || tireTypeFilter || rimTypeFilter || brandFilter || sizeFilter || conditionFilter || appliedPriceRange[0] > PRICE_MIN || appliedPriceRange[1] < PRICE_MAX) && (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{mt:2}} alignItems="center">
              <Typography variant="body2" fontWeight={700}>Đang lọc:</Typography>
              {categoryId && <Chip label={categories.find(item=>item.id===categoryId)?.name || "Danh mục"} onDelete={()=>setCategoryId("")} />}
              {tireTypeFilter && <Chip label={tireTypeFilter==="SOLID"?"Vỏ đặc":tireTypeFilter==="PNEUMATIC"?"Vỏ hơi":"Non-marking"} onDelete={()=>setTireTypeFilter("")} />}
              {rimTypeFilter && <Chip label={`Mâm ${rimTypeFilter}`} onDelete={()=>setRimTypeFilter("")} />}
              {brandFilter && <Chip label={`Thương hiệu: ${brandFilter}`} onDelete={()=>setBrandFilter("")} />}
              {sizeFilter && <Chip label={`Kích thước: ${sizeFilter}`} onDelete={()=>setSizeFilter("")} />}
              {conditionFilter && <Chip label={conditionFilter==="USED"?"Đã qua sử dụng":"Mới"} onDelete={()=>setConditionFilter("")} />}
              {(appliedPriceRange[0] > PRICE_MIN || appliedPriceRange[1] < PRICE_MAX) && <Chip label={`${appliedPriceRange[0].toLocaleString("vi-VN")} ₫ – ${appliedPriceRange[1].toLocaleString("vi-VN")} ₫`} onDelete={()=>{setPriceRange([PRICE_MIN,PRICE_MAX]);setAppliedPriceRange([PRICE_MIN,PRICE_MAX]);}} />}
              <Button size="small" onClick={()=>{setCategoryId("");setTireTypeFilter("");setRimTypeFilter("");setBrandFilter("");setSizeFilter("");setConditionFilter("");setPriceRange([PRICE_MIN,PRICE_MAX]);setAppliedPriceRange([PRICE_MIN,PRICE_MAX]);}}>Xóa tất cả</Button>
            </Stack>
          )}

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
          {categoryId === "category-tires" && <>
            <Typography variant="subtitle1" fontWeight={800} sx={{mt:2,mb:1}}>Loại vỏ</Typography>
            <Box sx={{display:"flex",flexWrap:"wrap",gap:1}}>{[["","Tất cả"],["SOLID","Vỏ đặc"],["PNEUMATIC","Vỏ hơi"],["NON_MARKING","Non-marking"]].map(([v,l])=><Button key={v||"all-tire"} size="small" variant={tireTypeFilter===v?"contained":"outlined"} onClick={()=>setTireTypeFilter(v)} sx={{borderRadius:99,textTransform:"none"}}>{l}</Button>)}</Box>
          </>}
          {categoryId === "category-rims" && <>
            <Typography variant="subtitle1" fontWeight={800} sx={{mt:2,mb:1}}>Loại mâm</Typography>
            <Box sx={{display:"flex",flexWrap:"wrap",gap:1}}>{["","CLICK","LIP","STANDARD"].map(v=><Button key={v||"all-rim"} size="small" variant={rimTypeFilter===v?"contained":"outlined"} onClick={()=>setRimTypeFilter(v)} sx={{borderRadius:99,textTransform:"none"}}>{v||"Tất cả"}</Button>)}</Box>
          </>}
          <Divider sx={{my:3}}/>
          <Typography variant="h6" fontWeight={800} sx={{mb:1.5}}>Thương hiệu</Typography>
          <TextField fullWidth size="small" value={brandFilter} onChange={e=>setBrandFilter(e.target.value)} placeholder="NEXEN, DUNLOP, OEM..."/>
          <Typography variant="h6" fontWeight={800} sx={{mt:2.5,mb:1.5}}>Kích thước</Typography>
          <Box sx={{display:"flex",flexWrap:"wrap",gap:1}}>{["","5.00-8","6.00-9","6.50-10","7.00-12"].map(v=><Button key={v||"all-size"} size="small" variant={sizeFilter===v?"contained":"outlined"} onClick={()=>setSizeFilter(v)} sx={{borderRadius:99,textTransform:"none"}}>{v||"Tất cả"}</Button>)}</Box>
          <Typography variant="h6" fontWeight={800} sx={{mt:2.5,mb:.5}}>Khoảng giá</Typography>
          <Stack direction="row" justifyContent="space-between" sx={{mb:.5}}><Typography variant="body2" fontWeight={700}>{priceRange[0].toLocaleString("vi-VN")} ₫</Typography><Typography variant="body2" fontWeight={700}>{priceRange[1].toLocaleString("vi-VN")} ₫</Typography></Stack>
          <Slider value={priceRange} min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP} onChange={(_,value)=>setPriceRange(value as number[])} onChangeCommitted={(_,value)=>setAppliedPriceRange(value as number[])} valueLabelDisplay="auto" valueLabelFormat={value=>`${value.toLocaleString("vi-VN")} ₫`} disableSwap aria-label="Khoảng giá sản phẩm" />
          <Divider sx={{my:3}}/>
          <Typography variant="h6" fontWeight={800} sx={{mb:1}}>Tình trạng</Typography>
          <Stack>
            <Stack>
            <FormControlLabel control={<Radio checked={!conditionFilter} onChange={()=>setConditionFilter("")}/>} label="Tất cả" />
            <FormControlLabel control={<Radio checked={conditionFilter==="NEW" || conditionFilter==="NEW_100"} onChange={()=>setConditionFilter("NEW")}/>} label="Mới" />
            <FormControlLabel control={<Radio checked={conditionFilter==="USED"} onChange={()=>setConditionFilter("USED")}/>} label="Đã qua sử dụng" />
          </Stack>
          <Divider sx={{my:3}}/>
          <Typography variant="h6" fontWeight={800} sx={{mb:1.5}}>Sắp xếp</Typography>
          <TextField select fullWidth size="small" value={sort} onChange={e=>setSort(e.target.value)}>
            <MenuItem value="newest">Mới nhất</MenuItem><MenuItem value="name">Tên A–Z</MenuItem><MenuItem value="price-asc">Giá thấp → cao</MenuItem><MenuItem value="price-desc">Giá cao → thấp</MenuItem>
          </TextField>
          <Button fullWidth size="large" variant="contained" onClick={()=>setFilterOpen(false)} sx={{mt:4,borderRadius:99}}>Xem {visibleProducts.length} sản phẩm</Button>
          </Stack>
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
