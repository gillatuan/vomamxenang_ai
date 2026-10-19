import { homeDesign } from "@/app/home-design";
"use client";
import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import ChatIcon from "@mui/icons-material/Chat";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import { QuoteRequestDialog } from "@/components/QuoteRequestDialog";
import { trackConversion } from "@/lib/conversion-analytics";
const phone="0913600210";
export function ServiceConversion({service}:{service:string}){const[open,setOpen]=useState(false);return <Box sx={{mt:4,p:{xs:2.5,md:4},bgcolor:"#fff",border:"1px solid",borderColor:homeDesign.colors.border,borderRadius:3}}>
<Typography sx={{color:homeDesign.colors.ink,fontSize:{xs:"1.4rem",md:"1.75rem"},fontWeight:750,lineHeight:1.3}}>Cần kiểm tra đúng loại trước khi làm?</Typography><Typography sx={{mt:1.5,color:homeDesign.colors.muted,lineHeight:1.75}}>Gửi ảnh bánh xe, kích thước hoặc model xe nâng. Chúng tôi sẽ đối chiếu và xác nhận phương án trước khi báo giá.</Typography>
<Stack direction={{xs:"column",sm:"row"}} spacing={1.5} sx={{mt:3,flexWrap:"wrap","& .MuiButton-root":{minHeight:44,borderRadius:2}}}><Button component="a" href={`tel:${phone}`} onClick={()=>trackConversion("CLICK_PHONE",{context:service})} variant="contained" startIcon={<PhoneIcon/>} sx={{bgcolor:homeDesign.colors.accent,color:homeDesign.colors.ink,"&:hover":{bgcolor:"#FBBF24"}}}>Gọi ngay</Button><Button component="a" href={`https://zalo.me/${phone}`} onClick={()=>trackConversion("CLICK_ZALO",{context:service})} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<ChatIcon/>}>Chat Zalo</Button><Button variant="outlined" startIcon={<RequestQuoteIcon/>} onClick={()=>{trackConversion("OPEN_QUOTE",{context:service});setOpen(true)}}>Yêu cầu báo giá</Button></Stack>
<QuoteRequestDialog open={open} onClose={()=>setOpen(false)} context={service}/></Box>}
