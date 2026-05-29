"use client";

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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import PrintIcon from "@mui/icons-material/Print";
import { useEffect, useMemo, useState } from "react";
import { productsAPI, Product } from "@/lib/api-client";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openQrDialog, setOpenQrDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(8);
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
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    setLoading(true);
    productsAPI
      .getAll()
      .then((res) => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Không thể tải danh sách sản phẩm.");
        setLoading(false);
      });
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      type: product.type,
      sku: product.id,
      name: product.name,
      importPrice: product.importPrice,
      sellingPrice: product.sellingPrice ?? 0,
      minStock: (product as any).minStock ?? 5,
      maxStock: (product as any).maxStock ?? 100,
      quantityInStock: product.quantityInStock,
      imageUrl: product.imageUrl || "",
      description: product.description || "",
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    const payload = {
      type: formData.type,
      name: formData.name,
      importPrice: formData.importPrice,
      sellingPrice: formData.sellingPrice,
      quantityInStock: formData.quantityInStock,
      imageUrl: formData.imageUrl,
      description: formData.description,
      minStock: formData.minStock,
      maxStock: formData.maxStock,
    };

    try {
      if (editingId) {
        await productsAPI.update(editingId, payload);
      } else {
        await productsAPI.create(payload);
      }
      loadProducts();
      setOpenDialog(false);
      setEditingId(null);
      setPreviewData({ sku: formData.sku || payload.name, name: formData.name });
      setOpenQrDialog(true);
    } catch (err) {
      alert("Lỗi khi lưu sản phẩm");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc muốn xóa sản phẩm này?")) {
      try {
        await productsAPI.delete(id);
        loadProducts();
      } catch (err) {
        alert("Lỗi khi xóa sản phẩm");
      }
    }
  };

  const filteredProducts = useMemo(() => {
    const type = activeTab === 0 ? "TIRE" : "RIM";
    return products
      .filter((item) => item.type === type)
      .filter((item) => item.name.toLowerCase().includes(searchText.toLowerCase()) || item.description?.toLowerCase().includes(searchText.toLowerCase()));
  }, [activeTab, products, searchText]);

  const rows = filteredProducts.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

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
          });
          setOpenDialog(true);
        }}>
          Thêm sản phẩm
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>Tên</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Mô tả</TableCell>
              <TableCell>Giá nhập</TableCell>
              <TableCell>Giá bán</TableCell>
              <TableCell>Tồn kho</TableCell>
              <TableCell>Min/Max</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.type}</TableCell>
                <TableCell>{product.description || "-"}</TableCell>
                <TableCell>{product.importPrice.toLocaleString()}</TableCell>
                <TableCell>{product.sellingPrice?.toLocaleString() || "-"}</TableCell>
                <TableCell>{product.quantityInStock}</TableCell>
                <TableCell>{`${(product as any).minStock ?? 5}/${(product as any).maxStock ?? 100}`}</TableCell>
                <TableCell>
                  <IconButton aria-label="edit" size="small" onClick={() => handleEdit(product)}>
                    <AddIcon />
                  </IconButton>
                  <IconButton aria-label="delete" size="small" color="error" onClick={() => handleDelete(product.id)}>
                    <DeleteIcon />
                  </IconButton>
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
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tên sản phẩm" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </Grid>
              <Grid item xs={12}>
              <TextField fullWidth label="Mô tả" multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Giá nhập" type="number" value={formData.importPrice} onChange={(e) => setFormData({ ...formData, importPrice: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Giá bán" type="number" value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Tồn kho" type="number" value={formData.quantityInStock} onChange={(e) => setFormData({ ...formData, quantityInStock: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Min Stock" type="number" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Max Stock" type="number" value={formData.maxStock} onChange={(e) => setFormData({ ...formData, maxStock: Number(e.target.value) })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Link ảnh" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Mô tả" multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button variant="outlined" onClick={() => setOpenDialog(false)}>
              Hủy
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Lưu và in tem
            </Button>
          </Box>
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
