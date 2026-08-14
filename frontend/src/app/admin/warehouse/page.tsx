"use client";

import { Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, LinearProgress, TextField, Typography } from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useEffect, useMemo, useState } from "react";
import apiClient from "@/lib/api";
import { AdminGridState } from "@/components/admin/AdminGridState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

type Stock = { quantity: number; product?: { name: string; sku: string }; wheelRim?: { sku: string; size: string } };
type Location = { id: string; locationCode: string; zone: string; rack: string; slot: string; capacity: number; stocks: Stock[] };
type Warehouse = { id: string; code: string; name: string; locations: Location[] };

export default function WarehouseMapPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selected, setSelected] = useState<Location | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = () => apiClient.get<Warehouse[]>("/warehouse/map").then((response) => setWarehouses(response.data)).catch(() => setError(true)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const locations = useMemo(() => warehouses.flatMap((warehouse) => warehouse.locations.map((location) => ({ ...location, warehouse }))), [warehouses]);
  const findLocation = () => {
    const match = locations.find((location) => location.locationCode.toLowerCase() === query.trim().toLowerCase());
    if (match) { setSelected(match); setScannerOpen(false); }
  };

  return <Box>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2, flexWrap: "wrap" }}>
      <AdminPageHeader title="Sơ đồ kho" description="Dung lượng và hàng tồn theo từng vị trí kho thực tế." />
      <Button variant="contained" startIcon={<QrCodeScannerIcon />} onClick={() => setScannerOpen(true)}>Tra cứu mã vị trí</Button>
    </Box>
    <AdminGridState loading={loading} error={error} empty={!loading && !error && !locations.length} />
    <Grid container spacing={2}>{locations.map((location) => {
      const quantity = location.stocks.reduce((total, stock) => total + stock.quantity, 0);
      const occupied = location.capacity ? Math.min(100, Math.round(quantity / location.capacity * 100)) : 0;
      const stockNames = location.stocks.map((stock) => stock.product?.name ?? stock.wheelRim?.sku).filter(Boolean).join(", ") || "Trống";
      return <Grid item xs={12} sm={6} md={4} key={location.id}><Card onClick={() => setSelected(location)} sx={{ cursor: "pointer", '&:hover': { transform: "translateY(-2px)" }, transition: "transform .18s" }}><CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Box><Typography variant="caption" color="text.secondary">{location.warehouse.name} · Khu {location.zone}</Typography><Typography variant="h6">{location.locationCode}</Typography></Box><LocationOnIcon color={occupied > 85 ? "error" : occupied > 50 ? "warning" : "success"} /></Box>
        <Typography variant="body2" noWrap title={stockNames}>{stockNames}</Typography><LinearProgress variant="determinate" value={occupied} sx={{ height: 9, borderRadius: 5, mt: 1.5 }} /><Typography variant="caption">{quantity}/{location.capacity} đơn vị ({occupied}%)</Typography>
      </CardContent></Card></Grid>;
    })}</Grid>
    <Dialog open={scannerOpen} onClose={() => setScannerOpen(false)} maxWidth="sm" fullWidth><DialogTitle>Tra cứu vị trí kho</DialogTitle><DialogContent><Typography variant="body2" sx={{ mb: 2 }}>Nhập hoặc quét mã QR vị trí (ví dụ: K1-A-01-01).</Typography><TextField autoFocus fullWidth label="Mã vị trí" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && findLocation()} /></DialogContent><DialogActions><Button onClick={() => setScannerOpen(false)}>Đóng</Button><Button variant="contained" onClick={findLocation}>Tra cứu</Button></DialogActions></Dialog>
    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth><DialogTitle>Chi tiết vị trí kho</DialogTitle><DialogContent>{selected && <><Typography variant="h6">{selected.locationCode}</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>Khu {selected.zone} · Kệ {selected.rack} · Ô {selected.slot}</Typography><Typography>Sức chứa: {selected.capacity}</Typography><Typography sx={{ mt: 1 }}>Hàng đang lưu:</Typography>{selected.stocks.length ? selected.stocks.map((stock, index) => <Typography key={index} variant="body2">• {stock.product?.name ?? stock.wheelRim?.sku}: {stock.quantity}</Typography>) : <Typography variant="body2" color="text.secondary">Chưa có hàng tại vị trí này.</Typography>}</>}</DialogContent><DialogActions><Button onClick={() => setSelected(null)}>Đóng</Button></DialogActions></Dialog>
  </Box>;
}
