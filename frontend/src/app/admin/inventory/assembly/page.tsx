"use client";
import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { AdminGridState } from "@/components/admin/AdminGridState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { inventoryAPI } from "@/lib/api-client";

type Row = Awaited<ReturnType<typeof inventoryAPI.assembly>>["data"][number];

export default function AssemblyPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => { inventoryAPI.assembly().then((response) => setRows(response.data)).catch(() => setError(true)).finally(() => setLoading(false)); }, []);
  const columns: GridColDef<Row>[] = [
    { field: "product", headerName: "Lốp", flex: 1.5, valueGetter: (_, row) => row.product.name },
    { field: "wheelRim", headerName: "Mâm", flex: 1, valueGetter: (_, row) => row.wheelRim.sku },
    { field: "quantity", headerName: "Số lượng", type: "number", flex: .8 },
    { field: "pressingFee", headerName: "Phí ép", flex: 1, valueFormatter: (value) => `${Number(value).toLocaleString("vi-VN")} ₫` },
    { field: "createdAt", headerName: "Ngày", flex: 1, valueFormatter: (value) => new Date(value).toLocaleString("vi-VN") },
  ];
  return <Box><AdminPageHeader title="Ép mâm" description="Lịch sử thao tác ép lốp và mâm thực tế." /><AdminGridState loading={loading} error={error} empty={!loading && !error && !rows.length} />{!loading && !error && rows.length > 0 && <DataGrid autoHeight rows={rows} columns={columns} disableRowSelectionOnClick />}</Box>;
}
