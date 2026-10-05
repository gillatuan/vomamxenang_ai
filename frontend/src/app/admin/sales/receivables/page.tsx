"use client";
import PhoneIcon from "@mui/icons-material/Phone";
import { Alert, Box, Button, Chip, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useEffect, useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AgingBucket, ordersAPI, ReceivableOrder } from "@/lib/api-client";

const labels:Record<AgingBucket,string>={CURRENT:"Chưa đến hạn","1_30":"Quá hạn 1–30 ngày","31_60":"Quá hạn 31–60 ngày","61_90":"Quá hạn 61–90 ngày","90_PLUS":"Quá hạn >90 ngày"};
export default function ReceivablesPage(){
 const [rows,setRows]=useState<ReceivableOrder[]>([]),[error,setError]=useState<string|null>(null),[bucket,setBucket]=useState<"ALL"|AgingBucket>("ALL");
 const load=()=>ordersAPI.receivables().then(r=>setRows(r.data)).catch(()=>setError("Không thể tải công nợ."));
 useEffect(()=>{load();},[]);
 const filtered=useMemo(()=>bucket==="ALL"?rows:rows.filter(r=>r.agingBucket===bucket),[rows,bucket]);
 const total=rows.reduce((s,r)=>s+r.balance,0),overdue=rows.filter(r=>r.agingBucket!=="CURRENT").reduce((s,r)=>s+r.balance,0);
 const columns:GridColDef<ReceivableOrder>[]=[
  {field:"code",headerName:"Đơn",flex:1},{field:"client",headerName:"Khách hàng",flex:1.5,valueGetter:(_,r)=>r.client.company||r.client.name},
  {field:"paymentDueAt",headerName:"Hạn thanh toán",flex:1,valueFormatter:v=>v?new Date(v).toLocaleDateString("vi-VN"):"Chưa đặt"},
  {field:"agingBucket",headerName:"Tuổi nợ",flex:1.2,renderCell:p=><Chip size="small" label={labels[p.row.agingBucket]} color={p.row.agingBucket==="CURRENT"?"default":"warning"}/>},
  {field:"balance",headerName:"Còn nợ",flex:1,valueFormatter:v=>`${Number(v).toLocaleString("vi-VN")} ₫`},
  {field:"actions",headerName:"Liên hệ",width:130,sortable:false,renderCell:p=><Button component="a" href={`tel:${p.row.client.phone}`} startIcon={<PhoneIcon/>}>Gọi</Button>}
 ];
 return <Box><AdminPageHeader title="Công nợ phải thu" subtitle="Theo dõi số dư, hạn thanh toán và ưu tiên khách quá hạn."/>
 {error&&<Alert severity="error" sx={{mb:2}}>{error}</Alert>}
 <Stack direction={{xs:"column",md:"row"}} spacing={2} sx={{mb:2}}><Paper sx={{p:2,minWidth:220}}><Typography variant="body2">Tổng phải thu</Typography><Typography variant="h5">{total.toLocaleString("vi-VN")} ₫</Typography></Paper><Paper sx={{p:2,minWidth:220}}><Typography variant="body2">Đã quá hạn</Typography><Typography variant="h5">{overdue.toLocaleString("vi-VN")} ₫</Typography></Paper><TextField select label="Tuổi nợ" value={bucket} onChange={e=>setBucket(e.target.value as "ALL"|AgingBucket)} sx={{minWidth:220}}><MenuItem value="ALL">Tất cả</MenuItem>{Object.entries(labels).map(([k,v])=><MenuItem key={k} value={k}>{v}</MenuItem>)}</TextField></Stack>
 <DataGrid autoHeight rows={filtered} columns={columns} disableRowSelectionOnClick/></Box>;
}