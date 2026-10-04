"use client";
import { Alert, Box, Button, Chip, Divider, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { ProductContentResearch, productResearchAPI } from "@/lib/api-client";

export function ProductResearchPanel({productId,onApplied}:{productId?:string;onApplied?:()=>void}) {
 const [items,setItems]=useState<ProductContentResearch[]>([]),[error,setError]=useState(""),[researching,setResearching]=useState(false);
 const [source,setSource]=useState(""),[facts,setFacts]=useState(""),[description,setDescription]=useState("");
 const load=()=>productId&&productResearchAPI.list(productId).then(r=>setItems(r.data)).catch(()=>setError("Không thể tải research."));
 useEffect(()=>{load()},[productId]);
 if(!productId)return <Alert severity="info">Lưu sản phẩm trước để tạo research.</Alert>;
 const create=async()=>{try{await productResearchAPI.create(productId,{sources:source?[{url:source}]:[],facts:facts.split("\n").filter(Boolean).map(line=>{const [field,...rest]=line.split(":");return {field:field.trim(),value:rest.join(":").trim(),source};}),proposedContent:description?{description}: {}});setSource("");setFacts("");setDescription("");load();}catch{setError("Không thể tạo research.")}};
 return <Stack spacing={2}>
  {error&&<Alert severity="error">{error}</Alert>}
  <Typography variant="h6">SEO Content Research</Typography>
  <Alert severity="warning">AI chỉ research và tạo READY_FOR_REVIEW. Không tự Approve/Apply. Mỗi fact tự động phải có source + evidence.</Alert>
  <Button variant="contained" disabled={researching} onClick={async()=>{setResearching(true);setError("");try{await productResearchAPI.research(productId);load()}catch(e:any){setError(e?.response?.data?.message||"Auto research thất bại.")}finally{setResearching(false)}}}>{researching?"Đang research...":"Research từ Web"}</Button>
  <Divider><Typography variant="caption">hoặc nhập thủ công</Typography></Divider>
  <TextField label="URL nguồn tham khảo" value={source} onChange={e=>setSource(e.target.value)} fullWidth/>
  <TextField label="Facts (mỗi dòng: field: value)" value={facts} onChange={e=>setFacts(e.target.value)} multiline minRows={3} fullWidth/>
  <TextField label="Proposed description (chỉ viết từ facts phía trên)" value={description} onChange={e=>setDescription(e.target.value)} multiline minRows={4} fullWidth/>
  <Button variant="outlined" onClick={create}>Gửi để review</Button>
  <Divider/>
  {items.map(item=><Box key={item.id} sx={{border:"1px solid",borderColor:"divider",borderRadius:1,p:2}}>
   <Stack direction="row" justifyContent="space-between"><Typography fontWeight={700}>{new Date(item.createdAt).toLocaleString()}</Typography><Chip label={item.status}/></Stack>
   <Typography variant="subtitle2" sx={{mt:1}}>Nguồn</Typography>{item.sources?.map((s,i)=><Typography key={i} variant="body2" sx={{wordBreak:"break-all"}}>{s.url}</Typography>)}
   <Typography variant="subtitle2" sx={{mt:1}}>Facts</Typography>{item.facts?.map((f,i)=><Box key={i} sx={{mb:1}}><Typography variant="body2"><strong>{f.field}:</strong> {f.value}</Typography>{f.evidence&&<Typography variant="caption" color="text.secondary">Evidence: {f.evidence}</Typography>}{f.source&&<Typography variant="caption" display="block" sx={{wordBreak:"break-all"}}>Source: {f.source}</Typography>}</Box>)}
   {item.proposedContent?.description&&<><Typography variant="subtitle2" sx={{mt:1}}>Nội dung đề xuất</Typography><Typography variant="body2">{item.proposedContent.description}</Typography></>}
   {item.status==="READY_FOR_REVIEW"&&<Stack direction="row" spacing={1} sx={{mt:2}}><Button color="error" onClick={async()=>{await productResearchAPI.review(item.id,"REJECT");load()}}>Reject</Button><Button variant="contained" onClick={async()=>{await productResearchAPI.review(item.id,"APPROVE");load()}}>Approve</Button></Stack>}
   {item.status==="APPROVED"&&<Button sx={{mt:2}} variant="contained" color="success" onClick={async()=>{await productResearchAPI.apply(item.id);load();onApplied?.()}}>Apply vào Product</Button>}
  </Box>)}
 </Stack>;
}
