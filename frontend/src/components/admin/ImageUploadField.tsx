"use client";

import { Alert, Box, Button, LinearProgress, Stack, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useRef, useState } from "react";
import apiClient from "@/lib/api";

async function resizeImage(file: File, maxWidth=1600, maxHeight=1200, quality=.84): Promise<File> {
  const bitmap=await createImageBitmap(file);
  const scale=Math.min(1,maxWidth/bitmap.width,maxHeight/bitmap.height);
  const width=Math.max(1,Math.round(bitmap.width*scale));
  const height=Math.max(1,Math.round(bitmap.height*scale));
  const canvas=document.createElement("canvas"); canvas.width=width; canvas.height=height;
  const ctx=canvas.getContext("2d"); if(!ctx) throw new Error("Không thể xử lý ảnh.");
  ctx.drawImage(bitmap,0,0,width,height); bitmap.close();
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/webp",quality));
  if(!blob) throw new Error("Không thể resize ảnh.");
  return new File([blob], file.name.replace(/\.[^.]+$/,"")+".webp",{type:"image/webp"});
}

export function ImageUploadField({value,onChange,label="Ảnh đại diện"}:{value?:string;onChange:(url:string)=>void;label?:string}) {
  const input=useRef<HTMLInputElement>(null); const [busy,setBusy]=useState(false); const [error,setError]=useState("");
  const choose=async(file?:File)=>{
    if(!file)return; setBusy(true);setError("");
    try{
      if(!["image/jpeg","image/png","image/webp"].includes(file.type)) throw new Error("Chỉ hỗ trợ JPG, PNG hoặc WebP.");
      if(file.size>12*1024*1024) throw new Error("Ảnh gốc tối đa 12MB.");
      const resized=await resizeImage(file);
      const body=new FormData();body.append("file",resized);
      const {data}=await apiClient.post<{url:string}>("/admin/media/image",body,{headers:{"Content-Type":"multipart/form-data"}});
      onChange(data.url);
    }catch(e:any){setError(e.response?.data?.message||e.message||"Không thể upload ảnh.");}
    finally{setBusy(false);if(input.current)input.current.value="";}
  };
  return <Box>
    <Typography fontWeight={700} sx={{mb:1}}>{label}</Typography>
    {value&&<Box component="img" src={value} alt="Xem trước ảnh đã upload" sx={{width:"100%",maxHeight:280,objectFit:"cover",mb:1.5,bgcolor:"grey.100"}}/>}
    <input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>choose(e.target.files?.[0])}/>
    <Stack direction="row" spacing={1} alignItems="center">
      <Button variant="outlined" startIcon={<CloudUploadIcon/>} disabled={busy} onClick={()=>input.current?.click()}>{value?"Thay ảnh":"Upload ảnh"}</Button>
      {value&&<Button color="inherit" onClick={()=>onChange("")}>Xóa ảnh</Button>}
    </Stack>
    {busy&&<LinearProgress sx={{mt:1}}/>}
    {error&&<Alert severity="error" sx={{mt:1}}>{error}</Alert>}
    <Typography variant="caption" color="text.secondary">JPG/PNG/WebP · tự resize tối đa 1600×1200 · chuyển WebP để giảm dung lượng.</Typography>
  </Box>;
}
