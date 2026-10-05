"use client";
import { useEffect, useState } from "react";
import { Alert, Box, Chip, FormControl, InputLabel, Link, MenuItem, Paper, Select, Stack, Typography } from "@mui/material";
import { QuoteLead, QuoteLeadStatus, quoteLeadsAPI } from "@/lib/api-client";

const labels: Record<QuoteLeadStatus,string> = { NEW:"Mới", CONTACTED:"Đã liên hệ", QUOTED:"Đã báo giá", WON:"Thành công", LOST:"Không thành công" };
export default function QuoteLeadsPage() {
  const [rows,setRows]=useState<QuoteLead[]>([]); const [error,setError]=useState("");
  const load=()=>quoteLeadsAPI.getAll().then(r=>setRows(r.data)).catch(()=>setError("Không tải được yêu cầu báo giá."));
  useEffect(()=>{load()},[]);
  const status=async(id:string,value:QuoteLeadStatus)=>{try{await quoteLeadsAPI.updateStatus(id,value);setRows(v=>v.map(x=>x.id===id?{...x,status:value}:x));}catch{setError("Không cập nhật được trạng thái.");}};
  return <Box><Typography variant="h4" fontWeight={800} gutterBottom>Yêu cầu báo giá</Typography>
    <Typography color="text.secondary" sx={{mb:3}}>Lead từ website, sản phẩm khách đang xem và thông tin cần tư vấn.</Typography>
    {error&&<Alert severity="error" sx={{mb:2}}>{error}</Alert>}
    <Stack spacing={2}>{rows.map(row=><Paper key={row.id} variant="outlined" sx={{p:2}}>
      <Stack direction={{xs:"column",md:"row"}} spacing={2} justifyContent="space-between">
        <Box><Stack direction="row" spacing={1} alignItems="center"><Typography fontWeight={800}>{row.name}</Typography><Chip size="small" label={labels[row.status]} /></Stack>
          <Typography><Link href={`tel:${row.phone}`}>{row.phone}</Link>{row.zalo? ` · Zalo: ${row.zalo}`:""}</Typography>
          {row.company&&<Typography color="text.secondary">{row.company}</Typography>}
          {row.product&&<Typography sx={{mt:1}}>Sản phẩm: <b>{row.product.name}</b> ({row.product.sku}){row.quantity? ` · SL: ${row.quantity}`:""}</Typography>}
          {row.forkliftModel&&<Typography>Xe nâng: {row.forkliftModel}</Typography>}{row.location&&<Typography>Khu vực: {row.location}</Typography>}
          {row.note&&<Typography sx={{mt:1}}>{row.note}</Typography>}
          {row.imageUrl&&<Link href={row.imageUrl} target="_blank" rel="noopener noreferrer">Xem ảnh khách gửi</Link>}
          <Typography variant="caption" display="block" color="text.secondary" sx={{mt:1}}>{new Date(row.createdAt).toLocaleString("vi-VN")} · {row.landingPage||"website"}</Typography>
        </Box>
        <FormControl size="small" sx={{minWidth:180}}><InputLabel>Trạng thái</InputLabel><Select label="Trạng thái" value={row.status} onChange={e=>status(row.id,e.target.value as QuoteLeadStatus)}>{Object.entries(labels).map(([v,l])=><MenuItem key={v} value={v}>{l}</MenuItem>)}</Select></FormControl>
      </Stack>
    </Paper>)}{!rows.length&&!error&&<Typography color="text.secondary">Chưa có yêu cầu báo giá.</Typography>}</Stack>
  </Box>;
}
