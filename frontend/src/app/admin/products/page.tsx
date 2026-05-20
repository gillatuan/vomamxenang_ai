"use client";

import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  TextField,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import { productsAPI, Product } from "@/lib/api-client";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: "TIRE" as const,
    name: "",
    importPrice: 0,
    sellingPrice: 0,
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
      .catch((err) => {
        setError("Failed to load products");
        setLoading(false);
      });
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData({
      type: product.type,
      name: product.name,
      importPrice: product.importPrice,
      sellingPrice: product.sellingPrice || 0,
      quantityInStock: product.quantityInStock,
      imageUrl: product.imageUrl || "",
      description: product.description || "",
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await productsAPI.update(editingId, formData);
      } else {
        await productsAPI.create(formData);
      }
      loadProducts();
      setOpenDialog(false);
      setEditingId(null);
    } catch (err) {
      alert("Error saving product");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn chắc chắn?")) {
      try {
        await productsAPI.delete(id);
        loadProducts();
      } catch (err) {
        alert("Error deleting product");
      }
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <Box sx={{ marginBottom: "2rem" }}>
        <Button
          variant="contained"
          onClick={() => {
            setEditingId(null);
            setFormData({
              type: "TIRE",
              name: "",
              importPrice: 0,
              sellingPrice: 0,
              quantityInStock: 0,
              imageUrl: "",
              description: "",
            });
            setOpenDialog(true);
          }}
        >
          Thêm sản phẩm
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>Tên</TableCell>
              <TableCell>Loại</TableCell>
              <TableCell>Giá nhập</TableCell>
              <TableCell>Giá bán</TableCell>
              <TableCell>Tồn kho</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.type}</TableCell>
                <TableCell>{product.importPrice.toLocaleString()}</TableCell>
                <TableCell>{product.sellingPrice?.toLocaleString()}</TableCell>
                <TableCell>{product.quantityInStock}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleEdit(product)}>
                    Sửa
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete(product.id)}>
                    Xóa
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <Box sx={{ padding: "2rem" }}>
          <Select
            fullWidth
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as "TIRE" | "RIM" | "SERVICE" })
            }
            sx={{ marginBottom: "1rem" }}
          >
            <MenuItem value="TIRE">Lốp</MenuItem>
            <MenuItem value="RIM">Vành</MenuItem>
            <MenuItem value="SERVICE">Dịch vụ</MenuItem>
          </Select>
          <TextField
            fullWidth
            label="Tên sản phẩm"
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Giá nhập"
            type="number"
            margin="normal"
            value={formData.importPrice}
            onChange={(e) => setFormData({ ...formData, importPrice: Number(e.target.value) })}
          />
          <TextField
            fullWidth
            label="Giá bán"
            type="number"
            margin="normal"
            value={formData.sellingPrice}
            onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
          />
          <TextField
            fullWidth
            label="Tồn kho"
            type="number"
            margin="normal"
            value={formData.quantityInStock}
            onChange={(e) => setFormData({ ...formData, quantityInStock: Number(e.target.value) })}
          />
          <TextField
            fullWidth
            label="Link ảnh"
            margin="normal"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          />
          <TextField
            fullWidth
            label="Mô tả"
            margin="normal"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Box sx={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
            <Button variant="outlined" fullWidth onClick={() => setOpenDialog(false)}>
              Hủy
            </Button>
            <Button variant="contained" fullWidth onClick={handleSave}>
              Lưu
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
