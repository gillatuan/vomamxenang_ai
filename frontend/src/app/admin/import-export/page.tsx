"use client";

import { Box, Chip } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { AdminGridState } from "@/components/admin/AdminGridState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { inventoryAPI } from "@/lib/api-client";

type Row = Awaited<ReturnType<typeof inventoryAPI.logs>>["data"][number];

export default function ImportExportPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => { inventoryAPI.logs().then((response) => setRows(response.data)).catch(() => setError(true)).finally(() => setLoading(false)); }, []);
  const columns: GridColDef<Row>[] = [
    { field: "code", headerName: "Mã phiếu", flex: 1, valueGetter: (_, row) => row.transaction.code },
    { field: "type", headerName: "Loại", flex: 1, renderCell: (params) => <Chip size="small" label={params.row.transaction.type} color={params.row.transaction.type === "IMPORT" ? "success" : "warning"} /> },
    { field: "item", headerName: "Hàng hóa", flex: 1.6, valueGetter: (_, row) => row.product?.name ?? row.wheelRim?.sku ?? "—" },
    { field: "quantity", headerName: "Số lượng", type: "number", flex: .8 },
    { field: "price", headerName: "Đơn giá", flex: 1, valueFormatter: (value) => `${Number(value).toLocaleString("vi-VN")} ₫` },
    { field: "createdAt", headerName: "Thời gian", flex: 1.2, valueGetter: (_, row) => new Date(row.transaction.createdAt).toLocaleString("vi-VN") },
  ];
  return <Box><AdminPageHeader title="Giao dịch nhập / xuất" description="Nhật ký phiếu kho thực tế. Tồn kho chỉ thay đổi khi phiếu được xác nhận." /><AdminGridState loading={loading} error={error} empty={!loading && !error && !rows.length} />{!loading && !error && rows.length > 0 && <DataGrid autoHeight rows={rows} columns={columns} disableRowSelectionOnClick />}</Box>;
}
