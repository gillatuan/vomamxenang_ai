"use client";
import ContentSeoFields from "@/components/ContentSeoFields";
import type { SeoMetadata } from "@/lib/api-client";
import RichTextEditor from "@/components/RichTextEditor";
import RichTextContent from "@/components/RichTextContent";
import { richTextPlain } from "@/lib/rich-text";
import { ImageUploadField, PendingImage } from "@/components/admin/ImageUploadField";
import { ProductResearchPanel } from "@/components/admin/ProductResearchPanel";
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
  const [formData, setFormData] = useState({
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
    slug: "",
    seo: {} as SeoMetadata,
    status: "DRAFT" as ContentStatus,
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
      sellingPrice: product.sellingPrice ?? 0,
      minStock: (product as any).minStock ?? 5,
      maxStock: (product as any).maxStock ?? 100,
      quantityInStock: product.stocks.reduce((total, stock) => total + stock.quantity, 0),
      imageUrl: product.imageUrl || "",
      description: product.description || "",
      slug: product.slug || "",
      seo: product.seo || {},
      status: product.status ?? "PUBLISHED",
    });
    setOpenDialog(true);
  };

  const handleSave = async (status: ContentStatus = formData.status) => {
    if (!formData.sku.trim() || !formData.name.trim()) {
      setError("Vui lòng nhập SKU và tên sản phẩm trước khi lưu.");
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
      slug: formData.slug,
      seo: { ...formData.seo, keywords: (formData.seo.keywords || []).map(word => word.trim()).filter(Boolean) },
      minStock: formData.minStock,
      maxStock: formData.maxStock,
      status,
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
          <Tab label="Danh mục Vỏ xe" />
          <Tab label="Danh mục Mâm xe" />
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
            slug: "",
            seo: {} as SeoMetadata,
            status: "DRAFT",
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
              <Grid item xs={12}>
              <ContentSeoFields id={editingId || ""} kind="products" title={formData.name} content={formData.description} slug={formData.slug} seo={formData.seo} onChange={(data) => setFormData(current => ({ ...current, ...data }))} onContentChange={(description) => setFormData(current => ({ ...current, description }))} />
              <RichTextEditor label="Mô tả" value={formData.description} onChange={(description) => setFormData({ ...formData, description })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Giá nhập" type="number" value={formData.importPrice} onChange={(e) => setFormData({ ...formData, importPrice: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Giá bán" type="number" value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Min Stock" type="number" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Max Stock" type="number" value={formData.maxStock} onChange={(e) => setFormData({ ...formData, maxStock: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12}>
              <ProductResearchPanel productId={editingId || undefined} onApplied={loadProducts} />
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
