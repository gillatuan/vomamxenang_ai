"use client";
import ContentSeoFields from "@/components/ContentSeoFields";
import type { SeoMetadata } from "@/lib/api-client";
import RichTextEditor from "@/components/RichTextEditor";
import RichTextContent from "@/components/RichTextContent";
import { richTextPlain } from "@/lib/rich-text";
import { ImageUploadField, PendingImage } from "@/components/admin/ImageUploadField";
import apiClient from "@/lib/api";

import {
  Box,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  TextField,
  CircularProgress,
  Alert,
  Stack,
  Typography,
  TablePagination,
  InputAdornment,
  IconButton,
  GlobalStyles,
  Grid,
  Chip,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useEffect, useMemo, useState } from "react";
import { adminManagementAPI, ContentStatus, productsAPI, Product } from "@/lib/api-client";
import Image from "next/image";

type AdminProduct = Product & { importPrice: number; stocks: { quantity: number }[] };
type ProductForm = {
  type: Product["type"];
  sku: string;
  name: string;
  importPrice: number;
  sellingPrice: number | null;
  minStock: number;
  maxStock: number;
  quantityInStock: number;
  imageUrl: string;
  description: string;
  shortDescription: string;
  highlights: string[];
  specifications: Array<{ label: string; value: string }>;
  applications: string[];
  tags: string[];
  slug: string;
  seo: SeoMetadata;
  status: ContentStatus;
  size: string;
  brand: string;
  tireType: string;
  rimType: string;
  condition: "" | NonNullable<Product["condition"]>;
};

export default function ProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<AdminProduct | null>(null);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null);
  const [previewData, setPreviewData] = useState<{ sku: string; name: string } | null>(null);
  const [formData, setFormData] = useState<ProductForm>({
    type: "TIRE" as "TIRE" | "RIM" | "SERVICE",
    sku: "",
    name: "",
    importPrice: 0,
    sellingPrice: 0,
    minStock: 5,
    maxStock: 100,
    quantityInStock: 0,
    imageUrl: "",
    description: "",
    shortDescription: "",
    highlights: [],
    specifications: [],
    applications: [],
    tags: [],
    slug: "",
    seo: {} as SeoMetadata,
    status: "DRAFT" as ContentStatus,
    size: "", brand: "", tireType: "", rimType: "", condition: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    adminManagementAPI
      .products()
      .then((res) => {
        setProducts(res.data);
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        setError("Không thể tải danh sách sản phẩm.");
        setLoading(false);
      });
  };

  const handleEdit = (product: AdminProduct) => {
    setPendingImage(null);
    setEditingId(product.id);
    setFormData({
      type: product.type,
      sku: product.sku,
      name: product.name,
      importPrice: product.importPrice ?? 0,
      sellingPrice: product.sellingPrice ?? null,
      minStock: (product as any).minStock ?? 5,
      maxStock: (product as any).maxStock ?? 100,
      quantityInStock: (product.stocks ?? []).reduce((total, stock) => total + stock.quantity, 0),
      imageUrl: product.imageUrl || "",
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      highlights: product.highlights || [],
      specifications: product.specifications || [],
      applications: product.applications || [],
      tags: product.tags || [],
      slug: product.slug || "",
      seo: product.seo || {},
      status: product.status ?? "PUBLISHED",
      size: product.size || "", brand: product.brand || "", tireType: product.tireType || "", rimType: (product as any).rimType || "", condition: product.condition || "",
    });
    setOpenDialog(true);
  };

  const handleSave = async (status: ContentStatus = formData.status) => {
    if (!formData.sku.trim() || !formData.name.trim()) {
      setError("Vui lòng nhập SKU và tên sản phẩm trước khi lưu.");
      return;
    }
    if (status === "PUBLISHED" && (formData.shortDescription.trim().length < 50 || richTextPlain(formData.description).trim().length < 150)) {
      setError("Trước khi publish, hãy nhập mô tả ngắn ít nhất 50 ký tự và mô tả chi tiết ít nhất 150 ký tự dựa trên thông tin sản phẩm thực tế.");
      return;
    }
    try {
      let imageUrl = formData.imageUrl;
      if (pendingImage) {
        const body = new FormData();
        body.append("file", pendingImage.file, pendingImage.file.name);
        const upload = await apiClient.post<{url:string}>("/admin/media/image", body, {
          headers: { "Content-Type": undefined },
          transformRequest: [(data) => data],
        });
        imageUrl = upload.data.url;
      }
    const payload = {
      sku: formData.sku,
      type: formData.type,
      name: formData.name,
      importPrice: formData.importPrice,
      sellingPrice: formData.sellingPrice,
      imageUrl,
      description: formData.description,
      shortDescription: formData.shortDescription,
      highlights: formData.highlights.map(item => item.trim()).filter(Boolean),
      specifications: formData.specifications.filter(item => item.label.trim() && item.value.trim()).map(item => ({ label: item.label.trim(), value: item.value.trim() })),
      applications: formData.applications.map(item => item.trim()).filter(Boolean),
      tags: formData.tags.map(item => item.trim()).filter(Boolean),
      slug: formData.slug,
      seo: { ...formData.seo, keywords: (formData.seo.keywords || []).map(word => word.trim()).filter(Boolean) },
      minStock: formData.minStock,
      maxStock: formData.maxStock,
      status,
      size: formData.size || undefined,
      brand: formData.brand || undefined,
      tireType: formData.type === "TIRE" ? formData.tireType || undefined : undefined,
      rimType: formData.type === "RIM" ? formData.rimType || undefined : undefined,
      condition: formData.condition || undefined,
    };

      if (editingId) {
        await productsAPI.update(editingId, payload);
      } else {
        await productsAPI.create(payload);
      }
      loadProducts();
      setOpenDialog(false);
      setEditingId(null);
      setPendingImage(null);
      setPreviewData({ sku: formData.sku || payload.name, name: formData.name });
      setOpenQrDialog(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể lưu sản phẩm.");
    }
  };

  const handleSaveProductStatus = async (product: AdminProduct) => {
    const currentStatus = product.status ?? "PUBLISHED";
    const nextStatus: ContentStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const previousProducts = products;

    setProducts((current) => current.map((item) => item.id === product.id ? { ...item, status: nextStatus } : item));

    try {
      const response = await productsAPI.update(product.id, { status: nextStatus });
      setProducts((current) => current.map((item) => item.id === product.id ? { ...item, ...response.data, stocks: item.stocks } : item));
    } catch {
      setProducts(previousProducts);
      setError("Không thể cập nhật trạng thái sản phẩm.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await productsAPI.delete(id);
        loadProducts();
      } catch (err) {
        setError("Không thể xóa sản phẩm.");
      }
    }
  };

  const filteredProducts = useMemo(() => {
    const type = activeTab === 0 ? "TIRE" : "RIM";
    return products
      .filter((item) => item.type === type)
      .filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()) || richTextPlain(item.description || "").toLowerCase().includes(searchText.toLowerCase()));
  }, [activeTab, products, searchText]);

  const rows = filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <GlobalStyles
        styles={{
          "@media print": {
            body: { visibility: "hidden" },
            "#qr-label-preview": { visibility: "visible", position: "fixed", top: 0, left: 0, width: "100%" },
          },
        }}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab label="Vỏ xe" />
          <Tab label="Mâm xe" />
        </Tabs>
        <TextField
          size="small"
          placeholder="Tìm thương hiệu, kích thước"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
          sx={{ minWidth: 240 }}
        />
        <Button startIcon={<AddIcon />} variant="contained" onClick={() => {
          setPendingImage(null);
          setEditingId(null);
          setFormData({
            type: activeTab === 0 ? "TIRE" : "RIM",
            sku: "",
            name: "",
            importPrice: 0,
            sellingPrice: 0,
            minStock: 5,
            maxStock: 100,
            quantityInStock: 0,
            imageUrl: "",
            description: "",
            shortDescription: "",
            highlights: [],
            specifications: [],
            applications: [],
            tags: [],
            slug: "",
            seo: {} as SeoMetadata,
            status: "DRAFT",
            size: "", brand: "", tireType: "", rimType: "", condition: "",
          });
          setOpenDialog(true);
        }}>
          Thêm sản phẩm
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 1050 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>Tên</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Image</TableCell>
              <TableCell>Giá nhập</TableCell>
              <TableCell>Giá bán</TableCell>
              <TableCell>Tồn kho</TableCell>
              <TableCell>Min/Max</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((product) => (
              <TableRow key={product.id}>
                <TableCell sx={{ maxWidth: "210px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{product.name}</TableCell>
                <TableCell>{product.type}</TableCell>
                <TableCell>
                  {product.imageUrl ? (
                    <Image src={product.imageUrl} alt={product.name} width={80} height={80} />
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>{product.importPrice.toLocaleString()}</TableCell>
                <TableCell>{product.sellingPrice?.toLocaleString() || "-"}</TableCell>
                <TableCell>{product.stocks.reduce((total, stock) => total + stock.quantity, 0)}</TableCell>
                <TableCell>{`${(product as any).minStock ?? 5}/${(product as any).maxStock ?? 100}`}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={(product.status ?? "PUBLISHED") === "DRAFT" ? "Nháp" : "Đã publish"}
                    color={(product.status ?? "PUBLISHED") === "DRAFT" ? "default" : "success"}
                  />
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Button size="small" startIcon={<VisibilityIcon />} onClick={() => setViewingProduct(product)}>Xem</Button>
                    <Button size="small" startIcon={<EditIcon />} onClick={() => handleEdit(product)}>Sửa</Button>
                    <Button size="small" color={(product.status ?? "PUBLISHED") === "DRAFT" ? "success" : "inherit"} onClick={() => handleSaveProductStatus(product)}>
                      {(product.status ?? "PUBLISHED") === "DRAFT" ? "Publish" : "Về nháp"}
                    </Button>
                    <IconButton aria-label="Xóa sản phẩm" size="small" color="error" onClick={() => handleDelete(product.id)}><DeleteIcon /></IconButton>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={filteredProducts.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
      />

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <Box sx={{ padding: 3 }}>
          <Typography variant="h6" gutterBottom>
            {editingId ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth required disabled={Boolean(editingId)} label="SKU / mã QR" value={formData.sku} onChange={(e) => setFormData({ ...formData, sku: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tên sản phẩm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Loại sản phẩm" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as "TIRE"|"RIM"|"SERVICE" })}>
                <MenuItem value="TIRE">Vỏ xe</MenuItem><MenuItem value="RIM">Mâm xe</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Kích thước" placeholder="6.50-10" value={formData.size} onChange={(e)=>setFormData({...formData,size:e.target.value})}/></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Thương hiệu" value={formData.brand} onChange={(e)=>setFormData({...formData,brand:e.target.value})}/></Grid>
            <Grid item xs={12} sm={6}><TextField select fullWidth label="Tình trạng" value={formData.condition} onChange={(e)=>setFormData({...formData,condition:e.target.value as ProductForm["condition"]})}><MenuItem value="">Chưa chọn</MenuItem><MenuItem value="NEW">Mới</MenuItem><MenuItem value="USED">Cũ</MenuItem></TextField></Grid>
            {formData.type==="TIRE" && <Grid item xs={12} sm={6}><TextField select fullWidth label="Loại vỏ" value={formData.tireType} onChange={(e)=>setFormData({...formData,tireType:e.target.value})}><MenuItem value="">Chưa chọn</MenuItem><MenuItem value="SOLID">Vỏ đặc</MenuItem><MenuItem value="PNEUMATIC">Vỏ hơi</MenuItem><MenuItem value="NON_MARKING">Non-marking</MenuItem></TextField></Grid>}
            {formData.type==="RIM" && <Grid item xs={12} sm={6}><TextField select fullWidth label="Loại mâm" value={formData.rimType} onChange={(e)=>setFormData({...formData,rimType:e.target.value})}><MenuItem value="">Chưa chọn</MenuItem><MenuItem value="LIP">Lip</MenuItem><MenuItem value="CLICK">Click</MenuItem><MenuItem value="STANDARD">Standard</MenuItem></TextField></Grid>}
              <Grid item xs={12}>
              <ContentSeoFields id={editingId || ""} kind="products" title={formData.name} content={formData.description} slug={formData.slug} seo={formData.seo} onChange={(data) => setFormData(current => ({ ...current, ...data }))} onContentChange={(description) => setFormData(current => ({ ...current, description }))} />
              <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }} fontWeight={700}>Nội dung bán hàng do Admin biên tập</Typography>
              <Alert severity="info" sx={{ mb: 2 }}>Nhập thông tin đúng theo sản phẩm và ảnh thực tế. Website và metadata SEO lấy dữ liệu đã lưu, không tự tạo lời giới thiệu. Mọi thay đổi cần được kiểm tra trước khi publish.</Alert>
              <TextField fullWidth multiline minRows={3} label="Mô tả ngắn – lý do khách nên quan tâm" helperText="Viết riêng cho SKU: loại vỏ/mâm, kích thước, tình trạng và lợi ích thực tế đã xác nhận." value={formData.shortDescription} onChange={e => setFormData(current => ({ ...current, shortDescription: e.target.value }))} sx={{ mb: 2 }} />
              <RichTextEditor label="Mô tả chi tiết – đặc điểm, ứng dụng, lưu ý lắp và tư vấn" value={formData.description} onChange={(description) => setFormData(current => ({ ...current, description }))} enableMedia />
              <TextField fullWidth multiline minRows={3} label="Điểm nổi bật (mỗi dòng một ý)" value={formData.highlights.join("\n")} onChange={e => setFormData(current => ({ ...current, highlights: e.target.value.split("\n") }))} helperText="Chỉ nhập ưu điểm có cơ sở; tránh cam kết tuổi thọ, tải trọng hoặc xuất xứ chưa xác minh." sx={{ mt: 2 }} />
              <Typography fontWeight={700} sx={{ mt: 2, mb: 1 }}>Thông số kỹ thuật / thuộc tính cần đối chiếu</Typography>
              <Stack spacing={1}>
                {formData.specifications.map((spec, index) => <Stack key={index} direction="row" spacing={1} alignItems="center">
                  <TextField size="small" label="Tên thông số" value={spec.label} onChange={e => setFormData(current => ({ ...current, specifications: current.specifications.map((item, i) => i === index ? { ...item, label: e.target.value } : item) }))} fullWidth />
                  <TextField size="small" label="Giá trị đã kiểm chứng" value={spec.value} onChange={e => setFormData(current => ({ ...current, specifications: current.specifications.map((item, i) => i === index ? { ...item, value: e.target.value } : item) }))} fullWidth />
                  <IconButton aria-label="Xóa thông số" color="error" onClick={() => setFormData(current => ({ ...current, specifications: current.specifications.filter((_, i) => i !== index) }))}><DeleteIcon /></IconButton>
                </Stack>)}
                <Button variant="outlined" onClick={() => setFormData(current => ({ ...current, specifications: [...current.specifications, { label: "", value: "" }] }))}>+ Thêm thông số</Button>
              </Stack>
              <TextField fullWidth multiline minRows={3} label="Ứng dụng phù hợp (mỗi dòng một trường hợp)" value={formData.applications.join("\n")} onChange={e => setFormData(current => ({ ...current, applications: e.target.value.split("\n") }))} sx={{ mt: 2 }} />
              <TextField fullWidth label="Nhãn sản phẩm (phân cách dấu phẩy)" value={formData.tags.join(", ")} onChange={e => setFormData(current => ({ ...current, tags: e.target.value.split(",").map(item => item.trim()) }))} helperText="Giữ các nhãn nghiệp vụ như VAT_EXCLUDED_INVOICE_AVAILABLE nếu sản phẩm có giá chưa VAT." sx={{ mt: 2 }} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Giá nhập" type="number" value={formData.importPrice} onChange={(e) => setFormData({ ...formData, importPrice: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Giá bán (để trống nếu cần báo giá)" type="number" value={formData.sellingPrice ?? ""} onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value === "" ? null : Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Min Stock" type="number" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Max Stock" type="number" value={formData.maxStock} onChange={(e) => setFormData({ ...formData, maxStock: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12}>
              <ImageUploadField value={formData.imageUrl} onChange={setPendingImage} label="Ảnh sản phẩm" />
              <TextField fullWidth label="Hoặc nhập URL ảnh" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} sx={{ mt: 1.5 }} />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button variant="outlined" onClick={() => setOpenDialog(false)}>
              Hủy
            </Button>
            <Button variant="outlined" onClick={() => handleSave("DRAFT")}>
              Lưu nháp
            </Button>
            <Button variant="contained" onClick={() => handleSave("PUBLISHED")}>
              Publish và in tem
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Dialog open={Boolean(viewingProduct)} onClose={() => setViewingProduct(null)} maxWidth="sm" fullWidth>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>{viewingProduct?.name}</Typography>
          {viewingProduct?.imageUrl && <Box component="img" src={viewingProduct.imageUrl} alt={viewingProduct.name} sx={{ width: "100%", maxHeight: 260, objectFit: "contain", mb: 2, borderRadius: 1, bgcolor: "grey.100" }} />}
          <Stack spacing={1}>
            <Typography><b>SKU:</b> {viewingProduct?.sku}</Typography>
            <Typography><b>Loại:</b> {viewingProduct?.type}</Typography>
            <Typography><b>Trạng thái:</b> {(viewingProduct?.status ?? "PUBLISHED") === "PUBLISHED" ? "Đã publish" : "Nháp"}</Typography>
            <Typography><b>Giá nhập:</b> {(viewingProduct?.importPrice ?? 0).toLocaleString()} ₫</Typography>
            <Typography><b>Giá bán:</b> {viewingProduct?.sellingPrice ? `${viewingProduct.sellingPrice.toLocaleString()} ₫` : "Liên hệ"}</Typography>
            <Box><Typography fontWeight={700}>Mô tả:</Typography><RichTextContent value={viewingProduct?.description || "Chưa có mô tả."} /></Box>
          </Stack>
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button onClick={() => setViewingProduct(null)}>Đóng</Button>
            {viewingProduct && <Button variant="contained" startIcon={<EditIcon />} onClick={() => { handleEdit(viewingProduct); setViewingProduct(null); }}>Chỉnh sửa</Button>}
          </Stack>
        </Box>
      </Dialog>

      <Dialog open={openQrDialog} onClose={() => setOpenQrDialog(false)} maxWidth="xs" fullWidth>
        <Box id="qr-label-preview" sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="h6" gutterBottom>
            Xem trước tem QR
          </Typography>
          <Paper sx={{ p: 2, mx: "auto", maxWidth: 320, border: "1px dashed #ccc" }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              {previewData?.name}
            </Typography>
            <Box component="img" src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(previewData?.sku || "")}`} alt="QR code" sx={{ width: 200, height: 200, mx: "auto" }} />
            <Typography variant="body2" sx={{ mt: 1, wordBreak: "break-word" }}>
              SKU: {previewData?.sku}
            </Typography>
          </Paper>
          <Button startIcon={<PrintIcon />} variant="contained" sx={{ mt: 3 }} onClick={() => window.print()}>
            In tem
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
