"use client";

import { useState } from "react";
import NextLink from "next/link";
import { Box, Button, CircularProgress, Drawer, IconButton, Link, Paper, TextField, Typography } from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import apiClient from "@/lib/api";

type ChatItem={kind:"product"|"rim";id:string;name:string;size?:string;brand?:string;detail?:string;priceText:string;href:string;description?:string};
type Service={name:string;priceText:string;note:string};
type Reply={text:string;items:ChatItem[];services:Service[];disclaimer:string;followUp:string};
type Message={role:"customer"|"assistant";text:string;reply?:Reply};

const suggestions=["Vỏ 6.50-10 giá bao nhiêu?","Tôi cần mâm xe nâng","Dịch vụ ép vỏ","Tư vấn chọn vỏ"];

export function CustomerChatbox(){
 const [open,setOpen]=useState(false),[input,setInput]=useState(""),[loading,setLoading]=useState(false);
 const [messages,setMessages]=useState<Message[]>([{role:"assistant",text:"Xin chào! Tôi có thể giúp bạn tìm vỏ, mâm xe nâng, dịch vụ và giá hiện có. Bạn cần kích thước nào?"}]);
 const send=async(value=input)=>{
  const text=value.trim(); if(!text||loading)return;
  setMessages(m=>[...m,{role:"customer",text}]);setInput("");setLoading(true);
  try{const {data}=await apiClient.post<Reply>("/customer-chat",{message:text});setMessages(m=>[...m,{role:"assistant",text:data.text,reply:data}]);}
  catch{setMessages(m=>[...m,{role:"assistant",text:"Hiện chưa lấy được dữ liệu báo giá. Bạn vui lòng thử lại hoặc liên hệ cửa hàng để được hỗ trợ trực tiếp."}]);}
  finally{setLoading(false);}
 };
 return <>
  <Button onClick={()=>setOpen(true)} aria-label="Mở tư vấn sản phẩm" sx={{position:"fixed",right:{xs:16,md:28},bottom:{xs:16,md:28},zIndex:1200,minWidth:0,width:{xs:54,md:60},height:{xs:54,md:60},borderRadius:"50%",bgcolor:"primary.main",color:"#fff",boxShadow:"0 8px 28px rgba(0,0,0,.18)","&:hover":{bgcolor:"secondary.main"}}}><ChatBubbleOutlineIcon/></Button>
  <Drawer anchor="right" open={open} onClose={()=>setOpen(false)} PaperProps={{sx:{width:{xs:"100%",sm:420},bgcolor:"background.default"}}}>
   <Box sx={{height:"100%",display:"flex",flexDirection:"column"}}>
    <Box sx={{px:2.5,minHeight:72,display:"flex",alignItems:"center",borderBottom:"1px solid",borderColor:"divider",bgcolor:"background.paper"}}>
     <Box><Typography sx={{fontSize:".65rem",fontWeight:800,letterSpacing:".16em",color:"secondary.main",textTransform:"uppercase"}}>Tư vấn nhanh</Typography><Typography sx={{fontWeight:800}}>Vỏ Mâm Xe Nâng</Typography></Box>
     <IconButton onClick={()=>setOpen(false)} aria-label="Đóng tư vấn" sx={{ml:"auto"}}><CloseIcon/></IconButton>
    </Box>
    <Box sx={{flex:1,overflowY:"auto",p:2,display:"flex",flexDirection:"column",gap:1.5}}>
     {messages.map((m,i)=><Box key={i} sx={{alignSelf:m.role==="customer"?"flex-end":"stretch",maxWidth:m.role==="customer"?"85%":"100%"}}>
      <Paper sx={{p:1.5,bgcolor:m.role==="customer"?"primary.main":"background.paper",color:m.role==="customer"?"primary.contrastText":"text.primary",border:"1px solid",borderColor:m.role==="customer"?"primary.main":"divider"}}>
       <Typography sx={{fontSize:".88rem",lineHeight:1.6}}>{m.text}</Typography>
      </Paper>
      {m.reply?.items.map(item=><Paper key={item.kind+item.id} sx={{mt:1,p:1.5,border:"1px solid",borderColor:"divider"}}>
       <Typography sx={{fontWeight:800,fontSize:".88rem"}}>{item.name}</Typography>
       <Typography sx={{fontSize:".75rem",color:"text.secondary"}}>{[item.size,item.brand,item.detail].filter(Boolean).join(" · ")}</Typography>
       <Box sx={{mt:1,display:"flex",alignItems:"center",gap:1}}><Typography sx={{fontWeight:800,color:"secondary.main"}}>{item.priceText}</Typography><Link component={NextLink} href={item.href} sx={{ml:"auto",fontSize:".72rem",fontWeight:800,color:"primary.main",bgcolor:"transparent","&:hover":{color:"primary.dark"}}}>Xem chi tiết →</Link></Box>
      </Paper>)}
      {m.reply?.services.map((s,j)=><Box key={j} sx={{mt:1,p:1.25,borderLeft:"3px solid",borderColor:"secondary.main",bgcolor:"background.paper"}}><Typography sx={{fontWeight:800,fontSize:".82rem"}}>{s.name} · {s.priceText}</Typography><Typography sx={{fontSize:".72rem",color:"text.secondary"}}>{s.note}</Typography></Box>)}
      {m.reply&&<><Typography sx={{mt:1,fontSize:".68rem",color:"text.secondary",lineHeight:1.5}}>{m.reply.disclaimer}</Typography><Typography sx={{mt:.75,fontSize:".78rem",fontWeight:700}}>{m.reply.followUp}</Typography></>}
     </Box>)}
     {loading&&<CircularProgress size={22} sx={{alignSelf:"center",my:1}}/>}
    </Box>
    {messages.length===1&&<Box sx={{px:2,display:"flex",gap:.75,flexWrap:"wrap"}}>{suggestions.map(s=><Button key={s} variant="outlined" onClick={()=>send(s)} sx={{minHeight:34,px:1.2,fontSize:".67rem",borderColor:"divider",color:"text.primary"}}>{s}</Button>)}</Box>}
    <Box sx={{p:2,bgcolor:"background.paper",borderTop:"1px solid",borderColor:"divider",display:"flex",gap:1}}>
     <TextField fullWidth size="small" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} placeholder="VD: Vỏ 6.50-10 giá bao nhiêu?" inputProps={{"aria-label":"Nội dung cần tư vấn"}}/>
     <IconButton disabled={!input.trim()||loading} onClick={()=>send()} aria-label="Gửi" sx={{width:44,height:44,bgcolor:"primary.main",color:"#fff","&:hover":{bgcolor:"secondary.main"},"&.Mui-disabled":{bgcolor:"divider"}}}><SendIcon fontSize="small"/></IconButton>
    </Box>
   </Box>
  </Drawer>
 </>;
}
