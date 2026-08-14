"use client";
import { Box } from "@mui/material"; import { DataGrid,GridColDef,GridRenderCellParams } from "@mui/x-data-grid"; import { useEffect,useState } from "react"; import { AdminGridState } from "@/components/admin/AdminGridState"; import { AdminPageHeader } from "@/components/admin/AdminPageHeader"; import { ordersAPI } from "@/lib/api-client";
type Row = {
  id: string;
  code: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  client?: { name: string };
};

export default function OrdersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    ordersAPI.getAll().then((response) => setRows(response.data)).catch(() => setError(true)).finally(() => setLoading(false));
  }, []);

  const columns: GridColDef<Row>[] = [
    { field: "code", headerName: "Mã đơn", flex: 1 },
    { field: "client", headerName: "Khách hàng", flex: 1.5, valueGetter: (_, row) => row.client?.name ?? "Khách lẻ" },
    { field: "totalAmount", headerName: "Thành tiền", flex: 1, renderCell: (params: GridRenderCellParams<Row>) => `${params.row.totalAmount.toLocaleString("vi-VN")} ₫` },
    { field: "status", headerName: "Trạng thái", flex: 1 },
    { field: "createdAt", headerName: "Ngày tạo", flex: 1, valueFormatter: (value) => new Date(value).toLocaleString("vi-VN") },
  ];

  return <Box><AdminPageHeader title="Đơn hàng" /><AdminGridState loading={loading} error={error} empty={!loading && !error && !rows.length} />{!loading && !error && rows.length > 0 && <DataGrid autoHeight rows={rows} columns={columns} disableRowSelectionOnClick />}</Box>;
}
