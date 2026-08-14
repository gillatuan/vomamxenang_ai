"use client";

import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminManagementAPI, PriceMatrixProduct } from "@/lib/api-client";

export default function PriceMatrixPage() {
  const [rows, setRows] = useState<PriceMatrixProduct[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false); const [editing, setEditing] = useState<{ product: PriceMatrixProduct; customerType: "RETAIL" | "B2B_TIER1" | "B2B_TIER2"; price: string }>();
  const load = () => adminManagementAPI.priceMatrix().then((response) => setRows(response.data)).catch(() => setError(true)).finally(() => setLoading(false)); useEffect(() => { load(); }, []);
  const price = (row: PriceMatrixProduct, type: string) => row.priceMatrix.find((item) => item.customerType === type)?.price;
  const columns: GridColDef<PriceMatrixProduct>[] = [{ field: "sku", headerName: "SKU", flex: 1 }, { field: "name", headerName: "Sản phẩm", flex: 1.5 }, { field: "sellingPrice", headerName: "Giá lẻ", flex: 1, renderCell: (params: GridRenderCellParams<PriceMatrixProduct>) => params.row.sellingPrice == null ? "—" : `${params.row.sellingPrice.toLocaleString("vi-VN")} ₫` }, ...(["B2B_TIER1", "B2B_TIER2"] as const).map((type) => ({ field: type, headerName: type === "B2B_TIER1" ? "B2B Tier 1" : "B2B Tier 2", flex: 1, renderCell: (params: GridRenderCellParams<PriceMatrixProduct>) => { const currentPrice = price(params.row, type); return <Button size="small" onClick={() => setEditing({ product: params.row, customerType: type, price: String(currentPrice ?? "") })}>{currentPrice === undefined ? "Thiết lập" : currentPrice.toLocaleString("vi-VN")}</Button>; } }))];
  return <Box><AdminPageHeader title="Bảng giá B2B" description="Giá theo khách hàng; không ảnh hưởng giá bán lẻ" />{error ? <Alert severity="error">Không thể tải bảng giá.</Alert> : loading ? <CircularProgress /> : <DataGrid autoHeight rows={rows} columns={columns} disableRowSelectionOnClick pageSizeOptions={[10,25]} initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }} />}{editing && <Dialog open onClose={() => setEditing(undefined)}><DialogTitle>Cập nhật giá B2B</DialogTitle><DialogContent><TextField autoFocus fullWidth type="number" label="Giá" value={editing.price} onChange={(event) => setEditing({ ...editing, price: event.target.value })} /></DialogContent><DialogActions><Button onClick={() => setEditing(undefined)}>Hủy</Button><Button onClick={() => { const value = Number(editing.price); if (Number.isFinite(value) && value >= 0) adminManagementAPI.updatePriceMatrix(editing.product.id, editing.customerType, value).then(() => { setEditing(undefined); load(); }); }}>Lưu</Button></DialogActions></Dialog>}</Box>;
}
