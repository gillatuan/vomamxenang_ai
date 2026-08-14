"use client";

import { Alert, Box, CircularProgress, TextField } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { inventoryAPI, StockLocationRow } from "@/lib/api-client";

export default function StockPage() {
  const [rows, setRows] = useState<StockLocationRow[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState(false); const [search, setSearch] = useState("");
  useEffect(() => { inventoryAPI.stockSummary().then((response) => setRows(response.data)).catch(() => setError(true)).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => rows.filter((row) => `${row.location.locationCode} ${row.product?.sku ?? row.wheelRim?.sku ?? ""} ${row.product?.name ?? row.wheelRim?.size ?? ""}`.toLowerCase().includes(search.toLowerCase())), [rows, search]);
  const columns: GridColDef<StockLocationRow>[] = [{ field: "warehouse", headerName: "Kho", flex: 1, valueGetter: (_, row) => row.location.warehouse?.code ?? "—" }, { field: "location", headerName: "Vị trí", flex: 1, valueGetter: (_, row) => row.location.locationCode }, { field: "sku", headerName: "SKU", flex: 1, valueGetter: (_, row) => row.product?.sku ?? row.wheelRim?.sku ?? "—" }, { field: "item", headerName: "Sản phẩm / Mâm", flex: 1.5, valueGetter: (_, row) => row.product?.name ?? row.wheelRim?.size ?? "—" }, { field: "quantity", headerName: "Số lượng", type: "number", flex: .7 }, { field: "capacity", headerName: "Sức chứa", type: "number", flex: .7, valueGetter: (_, row) => row.location.capacity }];
  return <Box><AdminPageHeader title="Tồn kho" description="Tồn kho vật lý theo từng vị trí kho" actions={<TextField size="small" label="Tìm SKU / vị trí" value={search} onChange={(event) => setSearch(event.target.value)} />} />{error ? <Alert severity="error">Không thể tải dữ liệu tồn kho.</Alert> : loading ? <CircularProgress /> : <DataGrid autoHeight rows={filtered} columns={columns} disableRowSelectionOnClick pageSizeOptions={[10, 25, 50]} initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }} />}</Box>;
}
