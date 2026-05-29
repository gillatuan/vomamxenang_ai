"use client";

import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  TextField,
  Autocomplete,
  Switch,
  FormControlLabel,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Alert,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { clientsAPI, productsAPI, Client, Product } from "@/lib/api-client";

interface InvoiceLine {
  productId: string;
  quantity: number;
  price: number;
  locationId: string;
}

const locationOptions = [
  { id: "LOC-01", label: "K1-A-01-01" },
  { id: "LOC-02", label: "K1-A-01-02" },
  { id: "LOC-03", label: "K1-B-02-03" },
  { id: "LOC-04", label: "K2-C-03-05" },
];

export default function ImportExportPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [customerType, setCustomerType] = useState("RETAIL");
  const [lines, setLines] = useState<InvoiceLine[]>([
    { productId: "", quantity: 1, price: 0, locationId: "LOC-01" },
  ]);
  const [pressingMode, setPressingMode] = useState(false);
  const [pressingDetails, setPressingDetails] = useState({ tire: "", rim: "", fee: 0 });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    clientsAPI.getAll().then((res) => setClients(res.data)).catch(() => setClients([]));
    productsAPI.getAll().then((res) => setProducts(res.data)).catch(() => setProducts([]));
  }, []);

  const customerOptions = useMemo(
    () => clients.map((client) => ({ label: client.name, id: client.id })),
    [clients]
  );

  const productOptions = useMemo(
    () => products.map((product) => ({ label: product.name, id: product.id, price: product.sellingPrice ?? product.importPrice })),
    [products]
  );

  const handleAddLine = () => {
    setLines((current) => [...current, { productId: "", quantity: 1, price: 0, locationId: "LOC-01" }]);
  };

  const handleRemoveLine = (index: number) => {
    setLines((current) => current.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, updated: Partial<InvoiceLine>) => {
    setLines((current) => current.map((line, i) => (i === index ? { ...line, ...updated } : line)));
  };

  useEffect(() => {
    if (!selectedClient) return;
    const isB2B = selectedClient.notes?.toLowerCase().includes("b2b") || selectedClient.company?.toLowerCase().includes("b2b");
    const nextCustomerType = isB2B ? "B2B" : "RETAIL";
    setCustomerType(nextCustomerType);
    if (nextCustomerType === "B2B") {
      setLines((current) => current.map((line) => {
        const product = products.find((item) => item.id === line.productId);
        return {
          ...line,
          price: product ? Math.round((product.importPrice || 0) * 1.05) : line.price,
        };
      }));
    }
  }, [selectedClient, products]);

  const totalAmount = useMemo(
    () => lines.reduce((sum, line) => sum + line.quantity * line.price + (pressingMode ? pressingDetails.fee : 0), 0),
    [lines, pressingMode, pressingDetails]
  );

  const inventoryLogs = [
    { id: "LOG-001", type: "IN", reference: "PNK-1002", description: "Nhập lốp 6.00-9", quantity: 52 },
    { id: "LOG-002", type: "OUT", reference: "PXK-2045", description: "Xuất mâm 8 lỗ", quantity: 14 },
    { id: "LOG-003", type: "PRESS", reference: "ÉP-718", description: "Ép lốp vào mâm 7.00-12", quantity: 12 },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Nhập / Xuất hàng và dịch vụ ép mâm
      </Typography>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Autocomplete
              options={customerOptions}
              value={selectedClient ? { label: selectedClient.name, id: selectedClient.id } : null}
              onChange={(_, value) => {
                const client = clients.find((item) => item.id === value?.id) ?? null;
                setSelectedClient(client);
              }}
              renderInput={(params) => <TextField {...params} label="Chọn khách hàng" />}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Loại khách hàng"
              value={customerType}
              fullWidth
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={<Switch checked={pressingMode} onChange={(event) => setPressingMode(event.target.checked)} />}
              label="Kích hoạt dịch vụ ép / ghép mâm"
            />
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Chi tiết phiếu
        </Typography>
        {lines.map((line, index) => (
          <Grid key={index} container spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={productOptions}
                value={productOptions.find((item) => item.id === line.productId) ?? null}
                onChange={(_, value) => {
                  const product = products.find((item) => item.id === value?.id);
                  handleLineChange(index, {
                    productId: value?.id || "",
                    price: customerType === "B2B" && product ? Math.round((product.importPrice || 0) * 1.05) : value?.price || 0,
                  });
                }}
                renderInput={(params) => <TextField {...params} label="Sản phẩm" />}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                label="Số lượng"
                type="number"
                fullWidth
                value={line.quantity}
                onChange={(e) => handleLineChange(index, { quantity: Number(e.target.value) })}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <TextField
                label="Giá"
                type="number"
                fullWidth
                value={line.price}
                onChange={(e) => handleLineChange(index, { price: Number(e.target.value) })}
                disabled={customerType === "B2B"}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Autocomplete
                options={locationOptions}
                value={locationOptions.find((item) => item.id === line.locationId) ?? null}
                onChange={(_, value) => handleLineChange(index, { locationId: value?.id || line.locationId })}
                renderInput={(params) => <TextField {...params} label="Vị trí kho" />}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button color="error" variant="outlined" onClick={() => handleRemoveLine(index)}>
                Xóa
              </Button>
            </Grid>
          </Grid>
        ))}
        <Button variant="contained" onClick={handleAddLine} sx={{ mt: 1 }}>
          Thêm dòng hàng
        </Button>
      </Paper>

      {pressingMode && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Chi tiết dịch vụ ép mâm
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <TextField
                label="Lốp ép"
                fullWidth
                value={pressingDetails.tire}
                onChange={(event) => setPressingDetails({ ...pressingDetails, tire: event.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Mâm ghép"
                fullWidth
                value={pressingDetails.rim}
                onChange={(event) => setPressingDetails({ ...pressingDetails, rim: event.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Phí ép"
                type="number"
                fullWidth
                value={pressingDetails.fee}
                onChange={(event) => setPressingDetails({ ...pressingDetails, fee: Number(event.target.value) })}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">Tổng hóa đơn</Typography>
          <Typography variant="h6">{totalAmount.toLocaleString()} đ</Typography>
        </Stack>
        <Button variant="contained" onClick={() => setMessage("Phiếu nhập/xuất đã được tạo. Vui lòng xử lý tiếp theo trong hệ thống.")}>
          Lưu phiếu
        </Button>
        {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Nhật ký tồn kho gần đây
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Tham chiếu</TableCell>
                <TableCell>Mô tả</TableCell>
                <TableCell>Số lượng</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventoryLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.id}</TableCell>
                  <TableCell>
                    <Chip label={log.type} color={log.type === "IN" ? "success" : log.type === "OUT" ? "warning" : "primary"} />
                  </TableCell>
                  <TableCell>{log.reference}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{log.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
