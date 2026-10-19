"use client";
import { homeDesign } from "@/app/home-design";
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
import { Suspense, useCallback, useEffect, useState } from "react";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { SeoBreadcrumbs } from "@/components/SeoBreadcrumbs";
import { ProductImage, useStoreWatermark } from "@/components/ProductImage";
import { productsAPI, clientsAPI, categoriesAPI, Product } from "@/lib/api-client";
import { useCartStore } from "@/store/cart";

type ProductCategory = { id: string; name: string };

function ProductsContent({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [categoryError, setCategoryError] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [conditionFilter, setConditionFilter] = useState("");
  const [brandFilter,setBrandFilter]=useState(""); const [sizeFilter,setSizeFilter]=useState(""); const [tireTypeFilter,setTireTypeFilter]=useState(""); const [rimTypeFilter,setRimTypeFilter]=useState(""); const PRICE_MIN=0, PRICE_MAX=15000000, PRICE_STEP=50000;
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

  const loadCategories = useCallback(() => {
    setCategoryError(false);
    categoriesAPI.getPublic()
      .then(res => {
        if (!Array.isArray(res.data)) throw new Error('Invalid category response');
        setCategories(res.data);
      })
      .catch(() => setCategoryError(true));
  }, []);
  useEffect(() => { loadCategories(); }, [loadCategories]);
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
      <Box component="main"><Container maxWidth={false} sx={{ maxWidth: homeDesign.containerWidth, pt: { xs: 5, md: 9 }, pb: { xs: 7, md: 12 } }}>
        <SeoBreadcrumbs items={[{ name: "Trang chủ", path: "/" }, { name: "Sản phẩm", path: "/products" }]} />
        {process.env.NEXT_PUBLIC_DEMO_PRICING === "true" && <Alert severity="warning" sx={{ mb: 3 }}>Đây là môi trường kiểm thử: giá sản phẩm là dữ liệu mẫu, không phải báo giá bán thực tế. Không đặt hàng hoặc thanh toán thật.</Alert>}
        <Typography sx={{ fontSize: { xs: ".75rem", md: ".8rem" }, letterSpacing: ".12em", fontWeight: 800, lineHeight: 1.5, color: homeDesign.colors.accent, mb: 1.5 }}>DANH MỤC SẢN PHẨM</Typography>
        <Typography component="h1" variant="h2" sx={{ fontSize: { xs: "2.1rem", md: "3.2rem" }, fontWeight: 750, lineHeight: 1.15, letterSpacing: "-.035em", color: homeDesign.colors.ink, mb: 2 }}>Vỏ xe nâng, mâm xe nâng phù hợp mọi nhu cầu.</Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 720, fontSize: { xs: "1rem", md: "1.15rem" }, lineHeight: 1.75, mb: { xs: 4, md: 6 } }}>Lựa chọn lốp và mâm phù hợp với tải trọng, môi trường và nhịp vận hành của đội xe.</Typography>

        <Box component="section" aria-label="Danh mục sản phẩm" sx={{ mb: 4, p: { xs: 2, md: 3 }, bgcolor: "#fff", border: `1px solid ${homeDesign.colors.border}`, borderRadius: 3 }}>
          {categoryError && <Alert severity="warning" action={<Button color="inherit" size="small" onClick={loadCategories}>Thử lại</Button>}>Chưa tải được danh mục. Bạn vẫn có thể xem và tìm sản phẩm.</Alert>}
          {categories.length > 0 && <Tabs textColor="primary" indicatorColor="primary" value={categoryId} onChange={(_,value)=>setCategoryId(value)} variant="scrollable" scrollButtons="auto" sx={{ borderBottom:"1px solid", borderColor:"divider", "& .MuiTab-root":{fontWeight:800,fontSize:{xs:".85rem",md:"1rem"},px:{xs:2,md:3}} }}>
            <Tab value="" label="Tất cả" />
            {categories.map(category=><Tab key={category.id} value={category.id} label={category.name}/>)}
          </Tabs>}
          <Stack direction={{xs:"column",sm:"row"}} spacing={1.5} sx={{mt:2}}>
            <TextField fullWidth size="small" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm tên, SKU, thương hiệu, kích thước..." sx={{"& .MuiOutlinedInput-root":{height:48,borderRadius:2,"&:hover .MuiOutlinedInput-notchedOutline":{borderColor:"primary.main"},"&.Mui-focused .MuiOutlinedInput-notchedOutline":{borderColor:"primary.main"}},"& .MuiInputLabel-root.Mui-focused":{color:"primary.main"}}} InputProps={{startAdornment:<InputAdornment position="start"><SearchIcon/></InputAdornment>}}/>
            <Button variant="outlined" startIcon={<TuneIcon/>} onClick={()=>setFilterOpen(true)} sx={{height:48,minWidth:150,borderRadius:2,fontWeight:700,color:"primary.main",borderColor:"primary.main","&:hover":{borderColor:"primary.main",bgcolor:"action.hover"}}}>Bộ lọc</Button>
            <TextField select size="small" value={sort} onChange={e=>setSort(e.target.value)} sx={{minWidth:210,...{"& .MuiOutlinedInput-root":{height:48,borderRadius:2,"&:hover .MuiOutlinedInput-notchedOutline":{borderColor:"primary.main"},"&.Mui-focused .MuiOutlinedInput-notchedOutline":{borderColor:"primary.main"}},"& .MuiInputLabel-root.Mui-focused":{color:"primary.main"}}}}>
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
              <Button size="small" variant="outlined" sx={{ minHeight: 36, px: 2, borderRadius: 2, borderColor: homeDesign.colors.border, color: homeDesign.colors.ink, bgcolor: "#fff", fontWeight: 700, textTransform: "none", "&:hover": { borderColor: homeDesign.colors.ink, bgcolor: homeDesign.colors.surface } }} onClick={()=>{setCategoryId("");setTireTypeFilter("");setRimTypeFilter("");setBrandFilter("");setSizeFilter("");setConditionFilter("");setPriceRange([PRICE_MIN,PRICE_MAX]);setAppliedPriceRange([PRICE_MIN,PRICE_MAX]);}}>Xóa tất cả</Button>
            </Stack>
          )}

        </Box>
        <Drawer anchor="left" open={filterOpen} onClose={()=>setFilterOpen(false)} PaperProps={{sx:{width:{xs:"92vw",sm:430},p:{xs:2.5,sm:3.5}}}}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h5" fontWeight={800} sx={{color:"primary.main"}}>Bộ lọc sản phẩm</Typography>
            <IconButton aria-label="Đóng bộ lọc" onClick={()=>setFilterOpen(false)} sx={{color:"primary.main"}}><CloseIcon/></IconButton>
          </Stack>
          <Divider sx={{my:2}}/>
          <Typography variant="h6" fontWeight={800} sx={{mb:1.5}}>Danh mục</Typography>
          <Box sx={{display:"flex",flexWrap:"wrap",gap:1}}>
            {[{id:"",name:"Tất cả"},...categories].map(category=>{
              const selected=categoryId===category.id;
              return <Button key={category.id || "all"} size="small" variant={selected?"contained":"outlined"} onClick={()=>setCategoryId(category.id)} sx={{borderRadius:99,textTransform:"none",px:2,...(selected?{bgcolor:"primary.main","&:hover":{bgcolor:"primary.dark"}}:{color:"primary.main",borderColor:"primary.main"})}}>{category.name}</Button>;
            })}
          </Box>
          {categoryId === "category-tires" && <>
            <Typography variant="subtitle1" fontWeight={800} sx={{mt:2,mb:1}}>Loại vỏ</Typography>
            <Box sx={{display:"flex",flexWrap:"wrap",gap:1}}>{[["","Tất cả"],["SOLID","Vỏ đặc"],["PNEUMATIC","Vỏ hơi"],["NON_MARKING","Non-marking"]].map(([v,l])=><Button key={v||"all-tire"} size="small" variant={tireTypeFilter===v?"contained":"outlined"} onClick={()=>setTireTypeFilter(v)} sx={{borderRadius:99,textTransform:"none",...(tireTypeFilter===v?{bgcolor:"primary.main","&:hover":{bgcolor:"primary.dark"}}:{color:"primary.main",borderColor:"primary.main"})}}>{l}</Button>)}</Box>
          </>}
          {categoryId === "category-rims" && <>
            <Typography variant="subtitle1" fontWeight={800} sx={{mt:2,mb:1}}>Loại mâm</Typography>
            <Box sx={{display:"flex",flexWrap:"wrap",gap:1}}>{["","CLICK","LIP","STANDARD"].map(v=><Button key={v||"all-rim"} size="small" variant={rimTypeFilter===v?"contained":"outlined"} onClick={()=>setRimTypeFilter(v)} sx={{borderRadius:99,textTransform:"none",color:"primary.main",borderColor:"primary.main","&.MuiButton-contained":{color:"#fff",bgcolor:"primary.main","&:hover":{bgcolor:"primary.dark"}}}}>{v||"Tất cả"}</Button>)}</Box>
          </>}
          <Divider sx={{my:3}}/>
          <Typography variant="h6" fontWeight={800} sx={{mb:1.5}}>Thương hiệu</Typography>
          <TextField fullWidth size="small" value={brandFilter} onChange={e=>setBrandFilter(e.target.value)} placeholder="NEXEN, DUNLOP, OEM..." sx={{"& .MuiOutlinedInput-root":{height:48,borderRadius:2,"&:hover .MuiOutlinedInput-notchedOutline":{borderColor:"primary.main"},"&.Mui-focused .MuiOutlinedInput-notchedOutline":{borderColor:"primary.main"}},"& .MuiInputLabel-root.Mui-focused":{color:"primary.main"}}}/>
          <Typography variant="h6" fontWeight={800} sx={{mt:2.5,mb:1.5}}>Kích thước</Typography>
          <Box sx={{display:"flex",flexWrap:"wrap",gap:1}}>{["","5.00-8","6.00-9","6.50-10","7.00-12"].map(v=><Button key={v||"all-size"} size="small" variant={sizeFilter===v?"contained":"outlined"} onClick={()=>setSizeFilter(v)} sx={{borderRadius:99,textTransform:"none",color:"primary.main",borderColor:"primary.main","&.MuiButton-contained":{color:"#fff",bgcolor:"primary.main","&:hover":{bgcolor:"primary.dark"}}}}>{v||"Tất cả"}</Button>)}</Box>
          <Typography variant="h6" fontWeight={800} sx={{mt:2.5,mb:.5}}>Khoảng giá</Typography>
          <Stack direction="row" justifyContent="space-between" sx={{mb:.5}}><Typography variant="body2" fontWeight={700}>{priceRange[0].toLocaleString("vi-VN")} ₫</Typography><Typography variant="body2" fontWeight={700}>{priceRange[1].toLocaleString("vi-VN")} ₫</Typography></Stack>
          <Slider value={priceRange} min={PRICE_MIN} max={PRICE_MAX} step={PRICE_STEP} onChange={(_,value)=>setPriceRange(value as number[])} onChangeCommitted={(_,value)=>setAppliedPriceRange(value as number[])} valueLabelDisplay="auto" valueLabelFormat={value=>`${value.toLocaleString("vi-VN")} ₫`} disableSwap aria-label="Khoảng giá sản phẩm" color="primary" />
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
          <TextField select fullWidth size="small" sx={{"& .MuiOutlinedInput-root":{height:48,borderRadius:2,"&:hover .MuiOutlinedInput-notchedOutline":{borderColor:"primary.main"},"&.Mui-focused .MuiOutlinedInput-notchedOutline":{borderColor:"primary.main"}},"& .MuiInputLabel-root.Mui-focused":{color:"primary.main"}}} value={sort} onChange={e=>setSort(e.target.value)}>
            <MenuItem value="newest">Mới nhất</MenuItem><MenuItem value="name">Tên A–Z</MenuItem><MenuItem value="price-asc">Giá thấp → cao</MenuItem><MenuItem value="price-desc">Giá cao → thấp</MenuItem>
          </TextField>
          <Button fullWidth size="large" variant="contained" onClick={()=>setFilterOpen(false)} sx={{mt:4,borderRadius:99,bgcolor:"primary.main","&:hover":{bgcolor:"primary.dark"}}}>Xem {visibleProducts.length} sản phẩm</Button>
          </Stack>
        </Drawer>
        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {pagedProducts.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "#fff", border: `1px solid ${homeDesign.colors.border}`, borderRadius: 3, overflow: "hidden", transition: "box-shadow .2s ease, transform .2s ease", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 16px 36px rgba(23,50,77,.1)" }, "&:hover img": { transform: "scale(1.035)" } }}>
                <ProductImage src={product.imageUrl} alt={product.seo?.imageAlt || `${product.name}${product.size ? ` ${product.size}` : ""}`} fallbackSrc={productFallbackImage(product)} watermark={watermark} imageSx={{ height: { xs: 240, md: 290 }, objectFit: "contain", bgcolor: homeDesign.colors.surface }} />
                <CardContent sx={{ flexGrow: 1, px: 2.5, pt: 2.5, pb: 1.5 }}>
                  <Typography component="h2" variant="h5" sx={{ fontSize: { xs: "1.15rem", md: "1.25rem" }, fontWeight: 700, lineHeight: 1.4, color: homeDesign.colors.ink }}>{product.name}</Typography>
                  <Chip
                    size="small"
                    sx={{ mt: 1 }}
                    color={product.condition === "USED" ? "warning" : "success"}
                    label={product.condition === "USED" ? "CŨ / LƯỚT" : "MỚI 100%"}
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ maxHeight: "5.5rem", overflow: "hidden", textOverflow: "ellipsis", mt: 1.5, lineHeight: 1.7 }}>
                    {productSeoDescription(product)}
                  </Typography>
                  <Typography variant="body1" sx={{ marginTop: "1rem", fontWeight: 700 }}>
                    {product.sellingPrice ? `${product.sellingPrice.toLocaleString()} ₫` : "Liên hệ"}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 2.5, pb: 2.5, pt: 1, gap: 1, flexWrap: "wrap" }}>
                  <Button component={NextLink} href={`/products/${product.slug || product.id}`} size="small" variant="text" sx={{ px: 0, color: homeDesign.colors.ink, fontWeight: 700, textDecoration: "underline", textUnderlineOffset: "4px", marginRight: "auto" }}>
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
        {pageCount > 1 && <Box component="nav" aria-label="Phân trang sản phẩm" sx={{display:"flex",justifyContent:"center",mt:5}}><Pagination page={page} count={pageCount} onChange={(_,value)=>setPage(value)} size="large" sx={{ "& .MuiPaginationItem-root": { color: homeDesign.colors.ink }, "& .Mui-selected": { bgcolor: `${homeDesign.colors.accent} !important`, color: homeDesign.colors.ink } }}/></Box>}
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
