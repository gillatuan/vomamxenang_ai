"use client";
import { Box } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { AdminGridState } from "@/components/admin/AdminGridState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { adminManagementAPI } from "@/lib/api-client";
type UserRow = { id: string; email: string; role: string; createdAt: string };
export default function UsersPage() { const [rows,setRows]=useState<UserRow[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState(false); useEffect(()=>{adminManagementAPI.users().then(r=>setRows(r.data)).catch(()=>setError(true)).finally(()=>setLoading(false));},[]); const columns: GridColDef<UserRow>[]=[{field:"email",headerName:"Email",flex:1.5},{field:"role",headerName:"Vai trò",flex:1},{field:"createdAt",headerName:"Ngày tạo",flex:1,valueFormatter:(value)=>new Date(value).toLocaleString("vi-VN")}]; return <Box><AdminPageHeader title="Người dùng" description="Danh sách không bao gồm password hoặc password hash"/><AdminGridState loading={loading} error={error} empty={!loading&&!error&&!rows.length}/>{!loading&&!error&&rows.length>0&&<DataGrid autoHeight rows={rows} columns={columns} disableRowSelectionOnClick pageSizeOptions={[10,25]}/>}</Box>; }
