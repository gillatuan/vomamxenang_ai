"use client";
import DeleteIcon from "@mui/icons-material/Delete"; import EditIcon from "@mui/icons-material/Edit"; import VisibilityIcon from "@mui/icons-material/Visibility"; import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography } from "@mui/material"; import { DataGrid,GridColDef,GridRenderCellParams } from "@mui/x-data-grid"; import { useEffect,useState } from "react"; import { AdminGridState } from "@/components/admin/AdminGridState"; import { AdminPageHeader } from "@/components/admin/AdminPageHeader"; import { Order, ordersAPI } from "@/lib/api-client";
type Row = {
  id: string;
  code: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  client?: { name: string };
  fulfillment?: Order["fulfillment"];
};

export default function OrdersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [editing, setEditing] = useState<Order | null>(null);
  const [status, setStatus] = useState<Order["status"]>("PENDING");

  const load = () => { setLoading(true); setError(null); ordersAPI.getAll().then((response) => setRows(response.data)).catch(() => setError("Không thể tải danh sách đơn hàng.")).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);
  const updateStatus = async () => { if (!editing) return; try { await ordersAPI.updateStatus(editing.id, status); setEditing(null); load(); } catch { setError("Không thể cập nhật trạng thái đơn hàng."); } };
  const fulfill = async (order: Row) => { try { await ordersAPI.createFulfillment(order.id); load(); } catch { setError("Không thể tạo phiếu xuất. Kiểm tra tồn kho và trạng thái đơn."); } };
  const remove = async (order: Row) => { if (!window.confirm(`Xóa đơn ${order.code}? Chỉ đơn chưa thanh toán và chưa tạo checkout mới có thể xóa.`)) return; try { await ordersAPI.delete(order.id); load(); } catch { setError("Không thể xóa đơn hàng đã thanh toán hoặc đã tạo phiên checkout."); } };

  const columns: GridColDef<Row>[] = [
    { field: "code", headerName: "Mã đơn", flex: 1 },
    { field: "client", headerName: "Khách hàng", flex: 1.5, valueGetter: (_, row) => row.client?.name ?? "Khách lẻ" },
    { field: "totalAmount", headerName: "Thành tiền", flex: 1, renderCell: (params: GridRenderCellParams<Row>) => `${params.row.totalAmount.toLocaleString("vi-VN")} ₫` },
    { field: "status", headerName: "Trạng thái", flex: 1 },
    { field: "createdAt", headerName: "Ngày tạo", flex: 1, valueFormatter: (value) => new Date(value).toLocaleString("vi-VN") },
    { field: "fulfillment", headerName: "Xuất kho", flex: 1, valueGetter: (_, row) => row.fulfillment?.status === "CONFIRMED" ? "Đã xuất" : row.fulfillment ? "Chờ xác nhận" : "Chưa tạo" },
    { field: "actions", headerName: "Thao tác", width: 330, sortable: false, renderCell: (params: GridRenderCellParams<Row>) => <><Button size="small" startIcon={<VisibilityIcon />} onClick={() => setSelected(params.row as Order)}>Xem</Button><Button size="small" startIcon={<LocalShippingIcon />} disabled={Boolean(params.row.fulfillment)||params.row.status==="FAILED"} onClick={()=>fulfill(params.row)}>Tạo phiếu xuất</Button><Button size="small" disabled={params.row.status === "PAID" || Boolean(params.row.fulfillment)} startIcon={<EditIcon />} onClick={() => { setEditing(params.row as Order); setStatus(params.row.status as Order["status"]); }}>Sửa</Button><Button size="small" color="error" disabled={params.row.status === "PAID" || Boolean((params.row as Order).stripeSessionId) || Boolean(params.row.fulfillment)} startIcon={<DeleteIcon />} onClick={() => remove(params.row)}>Xóa</Button></> },
  ];

  return <Box><AdminPageHeader title="Đơn hàng" description="Xem, cập nhật đơn chưa thanh toán và xóa đơn nháp an toàn." />{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}<AdminGridState loading={loading} error={Boolean(error) && !rows.length} empty={!loading && !error && !rows.length} />{!loading && rows.length > 0 && <DataGrid autoHeight rows={rows} columns={columns} disableRowSelectionOnClick />}<Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm"><DialogTitle>Chi tiết đơn hàng</DialogTitle><DialogContent>{selected && <><Typography>Mã đơn: <strong>{selected.code}</strong></Typography><Typography>Khách hàng: {selected.client?.name ?? "Khách lẻ"}</Typography><Typography>Trạng thái: {selected.status}</Typography><Typography>Xuất kho: {selected.fulfillment?.status==="CONFIRMED"?"Đã xuất":selected.fulfillment?`Chờ xác nhận · ${selected.fulfillment.code}`:"Chưa tạo phiếu"}</Typography><Typography sx={{ mt: 2, fontWeight: 700 }}>Sản phẩm</Typography>{selected.items?.length ? selected.items.map((item) => <Typography key={item.id} variant="body2">• {item.product?.name ?? item.wheelRim?.sku ?? "Hàng hóa"} × {item.quantity} — {Number(item.price).toLocaleString("vi-VN")} ₫ ({item.location?.locationCode ?? "—"})</Typography>) : <Typography color="text.secondary">Không có chi tiết mặt hàng.</Typography>}</>}</DialogContent><DialogActions><Button onClick={() => setSelected(null)}>Đóng</Button></DialogActions></Dialog><Dialog open={Boolean(editing)} onClose={() => setEditing(null)} fullWidth maxWidth="xs"><DialogTitle>Cập nhật đơn hàng</DialogTitle><DialogContent><TextField select fullWidth sx={{ mt: 1 }} label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value as Order["status"])}><MenuItem value="PENDING">PENDING</MenuItem><MenuItem value="FAILED">FAILED</MenuItem></TextField></DialogContent><DialogActions><Button onClick={() => setEditing(null)}>Hủy</Button><Button variant="contained" onClick={updateStatus}>Lưu</Button></DialogActions></Dialog></Box>;
}
