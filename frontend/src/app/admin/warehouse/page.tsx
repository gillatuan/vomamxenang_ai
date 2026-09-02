"use client";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Alert, Box, Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, LinearProgress, MenuItem, TextField, Typography } from "@mui/material";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { useEffect, useMemo, useState } from "react";
import { warehousesAPI } from "@/lib/api-client";
import { AdminGridState } from "@/components/admin/AdminGridState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

type Stock = { quantity: number; product?: { name: string; sku: string }; wheelRim?: { sku: string; size: string } };
type Location = { id: string; locationCode: string; zone: string; rack: string; slot: string; capacity: number; stocks: Stock[] };
type Warehouse = { id: string; code: string; name: string; locations: Location[] };
type LocatedLocation = Location & { warehouse: Warehouse };
type WarehouseForm = { code: string; name: string };
type LocationForm = { warehouseId: string; zone: string; rack: string; slot: string; locationCode: string; capacity: number };
const emptyWarehouse: WarehouseForm = { code: "", name: "" };
const emptyLocation: LocationForm = { warehouseId: "", zone: "", rack: "", slot: "", locationCode: "", capacity: 50 };

export default function WarehouseMapPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [selected, setSelected] = useState<LocatedLocation | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warehouseDialog, setWarehouseDialog] = useState(false);
  const [locationDialog, setLocationDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [editingLocation, setEditingLocation] = useState<LocatedLocation | null>(null);
  const [warehouseForm, setWarehouseForm] = useState<WarehouseForm>(emptyWarehouse);
  const [locationForm, setLocationForm] = useState<LocationForm>(emptyLocation);

  const load = () => { setLoading(true); warehousesAPI.map().then((response) => setWarehouses(response.data as unknown as Warehouse[])).catch(() => setError("Không thể tải dữ liệu kho.")).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const locations = useMemo(() => warehouses.flatMap((warehouse) => warehouse.locations.map((location) => ({ ...location, warehouse }))), [warehouses]);
  const findLocation = () => {
    const match = locations.find((location) => location.locationCode.toLowerCase() === query.trim().toLowerCase());
    if (match) { setSelected(match); setScannerOpen(false); }
  };
  const openWarehouseEditor = (warehouse?: Warehouse) => { setEditingWarehouse(warehouse ?? null); setWarehouseForm(warehouse ? { code: warehouse.code, name: warehouse.name } : emptyWarehouse); setWarehouseDialog(true); };
  const saveWarehouse = async () => {
    if (!warehouseForm.code.trim() || !warehouseForm.name.trim()) return;
    try { if (editingWarehouse) await warehousesAPI.update(editingWarehouse.id, warehouseForm); else await warehousesAPI.create(warehouseForm); setWarehouseDialog(false); load(); } catch { setError("Không thể lưu kho hàng. Mã kho phải là duy nhất."); }
  };
  const removeWarehouse = async (warehouse: Warehouse) => {
    if (!window.confirm(`Xóa kho ${warehouse.name}? Kho phải không có vị trí lưu hàng.`)) return;
    try { await warehousesAPI.delete(warehouse.id); setSelected(null); load(); } catch { setError("Không thể xóa kho đang có vị trí hoặc lịch sử dữ liệu."); }
  };
  const openLocationEditor = (location?: LocatedLocation) => {
    setEditingLocation(location ?? null);
    setLocationForm(location ? { warehouseId: location.warehouse.id, zone: location.zone, rack: location.rack, slot: location.slot, locationCode: location.locationCode, capacity: location.capacity } : { ...emptyLocation, warehouseId: warehouses[0]?.id ?? "" });
    setLocationDialog(true);
  };
  const saveLocation = async () => {
    if (!locationForm.warehouseId || !locationForm.zone || !locationForm.rack || !locationForm.slot) return;
    try { if (editingLocation) await warehousesAPI.updateLocation(editingLocation.id, locationForm); else await warehousesAPI.createLocation(locationForm); setLocationDialog(false); setSelected(null); load(); } catch { setError("Không thể lưu vị trí kho. Mã vị trí phải là duy nhất."); }
  };
  const removeLocation = async (location: LocatedLocation) => {
    if (!window.confirm(`Xóa vị trí ${location.locationCode}?`)) return;
    try { await warehousesAPI.deleteLocation(location.id); setSelected(null); load(); } catch { setError("Không thể xóa vị trí đang có tồn kho hoặc lịch sử giao dịch."); }
  };

  return <Box>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2, flexWrap: "wrap" }}>
      <AdminPageHeader title="Sơ đồ kho" description="Tạo, sửa và quản lý vị trí kho. Vị trí có tồn kho hoặc lịch sử giao dịch được bảo vệ khỏi xóa." />
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}><Button variant="outlined" startIcon={<AddIcon />} onClick={() => openWarehouseEditor()}>Thêm kho</Button><Button variant="outlined" startIcon={<AddIcon />} onClick={() => openLocationEditor()}>Thêm vị trí</Button><Button variant="contained" startIcon={<QrCodeScannerIcon />} onClick={() => setScannerOpen(true)}>Tra cứu mã vị trí</Button></Box>
    </Box>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    <AdminGridState loading={loading} error={Boolean(error) && !locations.length} empty={!loading && !error && !locations.length} />
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
    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth><DialogTitle>Chi tiết vị trí kho</DialogTitle><DialogContent>{selected && <><Typography variant="h6">{selected.locationCode}</Typography><Typography color="text.secondary" sx={{ mb: 2 }}>{selected.warehouse.name} · Khu {selected.zone} · Kệ {selected.rack} · Ô {selected.slot}</Typography><Typography>Sức chứa: {selected.capacity}</Typography><Typography sx={{ mt: 1 }}>Hàng đang lưu:</Typography>{selected.stocks.length ? selected.stocks.map((stock, index) => <Typography key={index} variant="body2">• {stock.product?.name ?? stock.wheelRim?.sku}: {stock.quantity}</Typography>) : <Typography variant="body2" color="text.secondary">Chưa có hàng tại vị trí này.</Typography>}</>}</DialogContent><DialogActions>{selected && <><Button startIcon={<EditIcon />} onClick={() => openLocationEditor(selected)}>Sửa vị trí</Button><Button color="error" startIcon={<DeleteIcon />} onClick={() => removeLocation(selected)}>Xóa vị trí</Button><Button startIcon={<EditIcon />} onClick={() => openWarehouseEditor(selected.warehouse)}>Sửa kho</Button><Button color="error" startIcon={<DeleteIcon />} onClick={() => removeWarehouse(selected.warehouse)}>Xóa kho</Button></>}<Button onClick={() => setSelected(null)}>Đóng</Button></DialogActions></Dialog>
    <Dialog open={warehouseDialog} onClose={() => setWarehouseDialog(false)} fullWidth maxWidth="xs"><DialogTitle>{editingWarehouse ? "Cập nhật kho" : "Thêm kho"}</DialogTitle><DialogContent><TextField autoFocus required fullWidth sx={{ mt: 1, mb: 2 }} label="Mã kho" value={warehouseForm.code} onChange={(event) => setWarehouseForm({ ...warehouseForm, code: event.target.value })} /><TextField required fullWidth label="Tên kho" value={warehouseForm.name} onChange={(event) => setWarehouseForm({ ...warehouseForm, name: event.target.value })} /></DialogContent><DialogActions><Button onClick={() => setWarehouseDialog(false)}>Hủy</Button><Button variant="contained" onClick={saveWarehouse}>Lưu</Button></DialogActions></Dialog>
    <Dialog open={locationDialog} onClose={() => setLocationDialog(false)} fullWidth maxWidth="sm"><DialogTitle>{editingLocation ? "Cập nhật vị trí" : "Thêm vị trí"}</DialogTitle><DialogContent><TextField select required fullWidth sx={{ mt: 1, mb: 2 }} label="Kho" value={locationForm.warehouseId} onChange={(event) => setLocationForm({ ...locationForm, warehouseId: event.target.value })}>{warehouses.map((warehouse) => <MenuItem key={warehouse.id} value={warehouse.id}>{warehouse.code} — {warehouse.name}</MenuItem>)}</TextField>{([['zone', 'Khu vực'], ['rack', 'Kệ'], ['slot', 'Ô'], ['locationCode', 'Mã vị trí (tùy chọn)']] as [keyof Pick<LocationForm, 'zone' | 'rack' | 'slot' | 'locationCode'>, string][]).map(([key, label]) => <TextField key={key} required={key !== 'locationCode'} fullWidth sx={{ mb: 2 }} label={label} value={locationForm[key]} onChange={(event) => setLocationForm({ ...locationForm, [key]: event.target.value })} />)}<TextField required fullWidth type="number" label="Sức chứa" value={locationForm.capacity} onChange={(event) => setLocationForm({ ...locationForm, capacity: Number(event.target.value) })} /></DialogContent><DialogActions><Button onClick={() => setLocationDialog(false)}>Hủy</Button><Button variant="contained" onClick={saveLocation}>Lưu</Button></DialogActions></Dialog>
  </Box>;
}
