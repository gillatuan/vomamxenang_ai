"use client";

import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Slider, Stack, Typography } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useEffect, useRef, useState } from "react";

export type PendingImage = { file: File; previewUrl: string };

async function cropImage(file: File, zoom: number, offsetX: number, offsetY: number, size=1200, quality=.84): Promise<File> {
  const bitmap=await createImageBitmap(file);
  // The preview uses object-fit: cover, so calculate the crop in the exact same
  // coordinate system. At zoom=1 the visible square is the centered cover crop.
  // Positive preview translation moves the image right/down, therefore the
  // source crop moves left/up.
  const coverSourceSize=Math.min(bitmap.width,bitmap.height);
  const sourceSize=coverSourceSize/zoom;
  const centerX=(bitmap.width-sourceSize)/2;
  const centerY=(bitmap.height-sourceSize)/2;
  const travelX=Math.max(0,(bitmap.width-sourceSize)/2);
  const travelY=Math.max(0,(bitmap.height-sourceSize)/2);
  const sx=Math.max(0,Math.min(bitmap.width-sourceSize,centerX-(offsetX/100)*travelX));
  const sy=Math.max(0,Math.min(bitmap.height-sourceSize,centerY-(offsetY/100)*travelY));
  const canvas=document.createElement("canvas"); canvas.width=size; canvas.height=size;
  const ctx=canvas.getContext("2d"); if(!ctx) throw new Error("Không thể xử lý ảnh.");
  ctx.drawImage(bitmap,sx,sy,sourceSize,sourceSize,0,0,size,size); bitmap.close();
  const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/webp",quality));
  if(!blob) throw new Error("Không thể crop ảnh.");
  return new File([blob],file.name.replace(/\.[^.]+$/,"")+".webp",{type:"image/webp"});
}

export function ImageUploadField({value,onChange,label="Ảnh đại diện"}:{value?:string;onChange:(image:PendingImage|null)=>void;label?:string}) {
  const input=useRef<HTMLInputElement>(null);
  const [source,setSource]=useState<File|null>(null),[sourceUrl,setSourceUrl]=useState("");
  const [preview,setPreview]=useState(""),[error,setError]=useState("");
  const [zoom,setZoom]=useState(1),[x,setX]=useState(0),[y,setY]=useState(0),[open,setOpen]=useState(false);

  useEffect(()=>()=>{if(sourceUrl)URL.revokeObjectURL(sourceUrl);if(preview)URL.revokeObjectURL(preview);},[sourceUrl,preview]);

  const choose=(file?:File)=>{
    if(!file)return; setError("");
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)){setError("Chỉ hỗ trợ JPG, PNG hoặc WebP.");return;}
    if(file.size>12*1024*1024){setError("Ảnh gốc tối đa 12MB.");return;}
    if(sourceUrl)URL.revokeObjectURL(sourceUrl);
    setSource(file);setSourceUrl(URL.createObjectURL(file));setZoom(1);setX(0);setY(0);setOpen(true);
    if(input.current)input.current.value="";
  };
  const apply=async()=>{
    if(!source)return;
    try{
      const file=await cropImage(source,zoom,x,y);
      if(preview)URL.revokeObjectURL(preview);
      const previewUrl=URL.createObjectURL(file);setPreview(previewUrl);onChange({file,previewUrl});setOpen(false);
    }catch(e:any){setError(e.message||"Không thể crop ảnh.");}
  };

  return <Box>
    <Typography fontWeight={700} sx={{mb:1}}>{label}</Typography>
    {(preview||value)&&<Box component="img" src={preview||value} alt="Xem trước ảnh" sx={{width:"100%",maxHeight:320,objectFit:"contain",mb:1.5,bgcolor:"grey.100"}}/>}
    <input ref={input} hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>choose(e.target.files?.[0])}/>
    <Stack direction="row" spacing={1}>
      <Button variant="outlined" startIcon={<CloudUploadIcon/>} onClick={()=>input.current?.click()}>{preview||value?"Thay ảnh":"Chọn ảnh"}</Button>
      {(preview||value)&&<Button color="inherit" onClick={()=>{if(preview)URL.revokeObjectURL(preview);setPreview("");onChange(null);}}>Xóa ảnh</Button>}
    </Stack>
    {error&&<Alert severity="error" sx={{mt:1}}>{error}</Alert>}
    <Typography variant="caption" color="text.secondary">Ảnh chỉ được upload khi bấm Lưu nháp/Publish. Crop vuông 1200×1200 và chuyển WebP.</Typography>
    <Dialog open={open} onClose={()=>setOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Review & crop ảnh</DialogTitle>
      <DialogContent>
        {sourceUrl&&<Box sx={{height:360,overflow:"hidden",bgcolor:"grey.100",position:"relative",mb:2}}>
          <Box component="img" src={sourceUrl} alt="Ảnh crop" sx={{width:"100%",height:"100%",objectFit:"cover",transform:`translate(${x}%,${y}%) scale(${zoom})`,transformOrigin:"center"}}/>
        </Box>}
        <Typography>Zoom</Typography><Slider min={1} max={3} step={.05} value={zoom} onChange={(_,v)=>setZoom(v as number)}/>
        <Typography>Căn ngang</Typography><Slider min={-100} max={100} value={x} onChange={(_,v)=>setX(v as number)}/>
        <Typography>Căn dọc</Typography><Slider min={-100} max={100} value={y} onChange={(_,v)=>setY(v as number)}/>
      </DialogContent>
      <DialogActions><Button onClick={()=>setOpen(false)}>Hủy</Button><Button variant="contained" onClick={apply}>Dùng ảnh này</Button></DialogActions>
    </Dialog>
  </Box>;
}
