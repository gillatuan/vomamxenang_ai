"use client";
import { useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import ChatIcon from "@mui/icons-material/Chat";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import { QuoteRequestDialog } from "@/components/QuoteRequestDialog";
const phone="0913600210";
export function ServiceConversion({service}:{service:string}){const[open,setOpen]=useState(false);return <Box sx={{mt:4,p:{xs:2.5,md:4},bgcolor:"action.hover",border:"1px solid",borderColor:"divider"}}>
<Typography variant="h5" fontWeight={800}>Cần kiểm tra đúng loại trước khi làm?</Typography><Typography color="text.secondary" sx={{mt:1}}>Gửi ảnh bánh xe, kích thước hoặc model xe nâng. Chúng tôi sẽ đối chiếu và xác nhận phương án trước khi báo giá.</Typography>
<Stack direction={{xs:"column",sm:"row"}} spacing={1.5} sx={{mt:3}}><Button component="a" href={`tel:${phone}`} variant="contained" startIcon={<PhoneIcon/>}>Gọi ngay</Button><Button component="a" href={`https://zalo.me/${phone}`} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<ChatIcon/>}>Chat Zalo</Button><Button variant="outlined" startIcon={<RequestQuoteIcon/>} onClick={()=>setOpen(true)}>Yêu cầu báo giá</Button></Stack>
<QuoteRequestDialog open={open} onClose={()=>setOpen(false)} context={service}/></Box>}
