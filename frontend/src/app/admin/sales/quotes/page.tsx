"use client";
import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Chip, FormControl, InputLabel, Link, MenuItem, Paper, Select, Stack, TextField, Typography } from "@mui/material";
import { QuoteLead, QuoteLeadStatus, quoteLeadsAPI } from "@/lib/api-client";

type PipelineFilter=QuoteLeadStatus|""|"OVERDUE";
const pipelineFilters:readonly PipelineFilter[]=["","OVERDUE","NEW","CONTACTED","QUOTED","WON","LOST"];
const isPipelineFilter=(value:string):value is PipelineFilter=>pipelineFilters.includes(value as PipelineFilter);
const labels:Record<QuoteLeadStatus,string>={NEW:"Mới",CONTACTED:"Đã liên hệ",QUOTED:"Đã báo giá",WON:"Thành công",LOST:"Không thành công"};
const open=(s:QuoteLeadStatus)=>s!=="WON"&&s!=="LOST";
const localInput=(iso?:string|null)=>iso?new Date(new Date(iso).getTime()-new Date(iso).getTimezoneOffset()*60000).toISOString().slice(0,16):"";

export default function QuoteLeadsPage(){
 const [rows,setRows]=useState<QuoteLead[]>([]),[assignees,setAssignees]=useState<{id:string;email:string;role:string}[]>([]);
 const [error,setError]=useState(""),[statusFilter,setStatusFilter]=useState<PipelineFilter>(""),[assigneeFilter,setAssigneeFilter]=useState("");
 const [notes,setNotes]=useState<Record<string,string>>({});
 const load=()=>quoteLeadsAPI.getAll(statusFilter==="OVERDUE"?{overdue:true,assigneeId:assigneeFilter||undefined}:{status:statusFilter||undefined,assigneeId:assigneeFilter||undefined}).then(r=>setRows(r.data)).catch(()=>setError("Không tải được lead."));
 useEffect(()=>{quoteLeadsAPI.assignees().then(r=>setAssignees(r.data)).catch(()=>{});},[]);
 useEffect(()=>{load();},[statusFilter,assigneeFilter]);
 const overdueCount=useMemo(()=>rows.filter(r=>open(r.status)&&r.followUpAt&&new Date(r.followUpAt)<new Date()).length,[rows]);
 const patch=async(id:string,data:{assigneeId?:string|null;followUpAt?:string|null})=>{try{await quoteLeadsAPI.updateCrm(id,data);load();}catch{setError("Không cập nhật được CRM.");}};
 const status=async(id:string,value:QuoteLeadStatus)=>{try{await quoteLeadsAPI.updateStatus(id,value);load();}catch{setError("Không cập nhật được trạng thái.");}};
 const note=async(id:string)=>{const content=(notes[id]||"").trim();if(!content)return;try{await quoteLeadsAPI.addNote(id,content);setNotes(v=>({...v,[id]:""}));load();}catch{setError("Không lưu được ghi chú.");}};
 return <Box>
  <Typography variant="h4" fontWeight={800}>Lead CRM</Typography>
  <Typography color="text.secondary" sx={{mb:2}}>Theo dõi yêu cầu báo giá, người phụ trách và lịch gọi lại để không bỏ sót khách.</Typography>
  {error&&<Alert severity="error" onClose={()=>setError("")} sx={{mb:2}}>{error}</Alert>}
  <Stack direction={{xs:"column",md:"row"}} spacing={1.5} sx={{mb:2}}>
   <FormControl size="small" sx={{minWidth:180}}><InputLabel>Pipeline</InputLabel><Select label="Pipeline" value={statusFilter} onChange={e=>{const value=e.target.value;if(isPipelineFilter(value))setStatusFilter(value)}}><MenuItem value="">Tất cả</MenuItem><MenuItem value="OVERDUE">Quá hạn follow-up</MenuItem>{Object.entries(labels).map(([v,l])=><MenuItem key={v} value={v}>{l}</MenuItem>)}</Select></FormControl>
   <FormControl size="small" sx={{minWidth:220}}><InputLabel>Người phụ trách</InputLabel><Select label="Người phụ trách" value={assigneeFilter} onChange={e=>setAssigneeFilter(e.target.value)}><MenuItem value="">Tất cả</MenuItem>{assignees.map(a=><MenuItem key={a.id} value={a.id}>{a.email}</MenuItem>)}</Select></FormControl>
   <Chip label={`Đang hiển thị: ${rows.length}`} /><Chip color={overdueCount?"error":"default"} label={`Quá hạn: ${overdueCount}`} />
  </Stack>
  <Stack spacing={2}>{rows.map(row=>{const overdue=open(row.status)&&!!row.followUpAt&&new Date(row.followUpAt)<new Date();return <Paper key={row.id} variant="outlined" sx={{p:2,borderColor:overdue?"error.main":"divider"}}>
   <Stack direction={{xs:"column",lg:"row"}} spacing={2}>
    <Box sx={{flex:1}}>
     <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center"><Typography fontWeight={800}>{row.name}</Typography><Chip size="small" label={labels[row.status]} color={row.status==="WON"?"success":row.status==="LOST"?"default":"primary"}/>{overdue&&<Chip size="small" color="error" label="Quá hạn"/>}</Stack>
     <Stack direction="row" spacing={1} sx={{my:1}}><Button size="small" variant="contained" component="a" href={`tel:${row.phone}`}>Gọi {row.phone}</Button><Button size="small" variant="outlined" component="a" target="_blank" rel="noopener noreferrer" href={`https://zalo.me/${row.zalo||row.phone}`}>Zalo</Button></Stack>
     {row.company&&<Typography color="text.secondary">{row.company}</Typography>}
     {row.product&&<Typography>Sản phẩm: <b>{row.product.name}</b> ({row.product.sku}){row.quantity?` · SL: ${row.quantity}`:""}</Typography>}
     {row.forkliftModel&&<Typography>Xe nâng: {row.forkliftModel}</Typography>}{row.location&&<Typography>Khu vực: {row.location}</Typography>}
     {row.note&&<Typography sx={{mt:1}}>Khách gửi: {row.note}</Typography>}{row.imageUrl&&<Link href={row.imageUrl} target="_blank">Xem ảnh khách gửi</Link>}
     <Typography variant="caption" display="block" color="text.secondary" sx={{mt:1}}>Lead: {new Date(row.createdAt).toLocaleString("vi-VN")}{row.lastContactAt?` · Liên hệ gần nhất: ${new Date(row.lastContactAt).toLocaleString("vi-VN")}`:""}</Typography>
    </Box>
    <Stack spacing={1.25} sx={{width:{xs:"100%",lg:300}}}>
     <FormControl size="small"><InputLabel>Trạng thái</InputLabel><Select label="Trạng thái" value={row.status} onChange={e=>status(row.id,e.target.value as QuoteLeadStatus)}>{Object.entries(labels).map(([v,l])=><MenuItem key={v} value={v}>{l}</MenuItem>)}</Select></FormControl>
     <FormControl size="small"><InputLabel>Phụ trách</InputLabel><Select label="Phụ trách" value={row.assigneeId||""} onChange={e=>patch(row.id,{assigneeId:e.target.value||null})}><MenuItem value="">Chưa giao</MenuItem>{assignees.map(a=><MenuItem key={a.id} value={a.id}>{a.email}</MenuItem>)}</Select></FormControl>
     <TextField size="small" label="Follow-up" type="datetime-local" value={localInput(row.followUpAt)} InputLabelProps={{shrink:true}} onChange={e=>patch(row.id,{followUpAt:e.target.value?new Date(e.target.value).toISOString():null})}/>
    </Stack>
   </Stack>
   <Stack direction={{xs:"column",md:"row"}} spacing={1} sx={{mt:2}}><TextField fullWidth size="small" label="Ghi chú chăm sóc" value={notes[row.id]||""} onChange={e=>setNotes(v=>({...v,[row.id]:e.target.value}))}/><Button variant="outlined" onClick={()=>note(row.id)}>Lưu note</Button></Stack>
   {!!row.activities?.length&&<Box sx={{mt:2,pt:1.5,borderTop:"1px solid",borderColor:"divider"}}><Typography variant="subtitle2" fontWeight={800}>Lịch sử gần đây</Typography>{row.activities.slice(0,5).map(a=><Typography key={a.id} variant="body2" color="text.secondary">{new Date(a.createdAt).toLocaleString("vi-VN")} · {a.user.email}: {a.content}</Typography>)}</Box>}
  </Paper>})}{!rows.length&&!error&&<Typography color="text.secondary">Không có lead phù hợp bộ lọc.</Typography>}</Stack>
 </Box>;
}
