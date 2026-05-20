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
  CircularProgress,
  Alert,
} from "@mui/material";
import { useEffect, useState } from "react";
import { clientsAPI, Client } from "@/lib/api-client";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    setLoading(true);
    clientsAPI
      .getAll()
      .then((res) => {
        setClients(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load clients");
        setLoading(false);
      });
  };

  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    setFormData(client);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await clientsAPI.update(editingId, formData);
      } else {
        await clientsAPI.create(formData);
      }
      loadClients();
      setOpenDialog(false);
      setEditingId(null);
    } catch (err) {
      alert("Error saving client");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn chắc chắn?")) {
      try {
        await clientsAPI.delete(id);
        loadClients();
      } catch (err) {
        alert("Error deleting client");
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
            setFormData({ name: "", email: "", phone: "", company: "", notes: "" });
            setOpenDialog(true);
          }}
        >
          Thêm khách hàng
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell>Tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Công ty</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.company}</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleEdit(client)}>
                    Sửa
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete(client.id)}>
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
          <TextField
            fullWidth
            label="Tên"
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <TextField
            fullWidth
            label="Phone"
            margin="normal"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <TextField
            fullWidth
            label="Công ty"
            margin="normal"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
            <Button variant="contained" fullWidth onClick={handleSave}>
              Lưu
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
