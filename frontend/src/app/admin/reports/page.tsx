"use client";

import { Alert, Box, Card, CardContent, CircularProgress, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { adminManagementAPI } from "@/lib/api-client";
import { ConversionReport, conversionAnalyticsAPI } from "@/lib/conversion-analytics";

const Line=({label,value,detail}:{label:string;value:number;detail?:string})=><Stack direction="row" justifyContent="space-between" spacing={2} sx={{py:.5}}><Typography noWrap title={label}>{label}</Typography><Typography fontWeight={800}>{value}{detail?` · ${detail}`:""}</Typography></Stack>;

export default function ReportsPage(){
 const [conversion,setConversion]=useState<ConversionReport>();
 const [data,setData]=useState<Awaited<ReturnType<typeof adminManagementAPI.reports>>["data"]>();
 const [error,setError]=useState(false);
 useEffect(()=>{Promise.all([adminManagementAPI.reports(),conversionAnalyticsAPI.report()]).then(([response,conv])=>{setData(response.data);setConversion(conv.data)}).catch(()=>setError(true));},[]);
 if(error)return <Alert severity="error">Không thể tải báo cáo.</Alert>;
 if(!data||!conversion)return <CircularProgress/>;
 const s=conversion.sales;
 return <Box>
  <AdminPageHeader title="Báo cáo & Sales Intelligence" description="Doanh thu, tồn kho, funnel website và hiệu quả xử lý lead."/>
  <Grid container spacing={2}>
   <Grid item xs={12} sm={6} md={3}><StatCard label="Doanh thu" value={`${data.revenue.toLocaleString("vi-VN")} ₫`} icon="₫"/></Grid>
   <Grid item xs={12} sm={6} md={3}><StatCard label="Đơn đã thanh toán" value={data.paidOrders} icon="✓"/></Grid>
   <Grid item xs={12} sm={6} md={3}><StatCard label="Giá trị đơn TB" value={`${data.averageOrderValue.toLocaleString("vi-VN")} ₫`} icon="₫"/></Grid>
   <Grid item xs={12} sm={6} md={3}><StatCard label="Giá trị tồn kho" value={`${data.inventoryCost.toLocaleString("vi-VN")} ₫`} icon="₫"/></Grid>

   <Grid item xs={12}><Typography variant="h5" fontWeight={800} sx={{mt:1}}>Sales pipeline</Typography></Grid>
   <Grid item xs={6} md={2}><StatCard label="Lead tổng" value={s.totalLeads} icon="◎"/></Grid>
   <Grid item xs={6} md={2}><StatCard label="Lead 30 ngày" value={s.recentLeads} icon="30"/></Grid>
   <Grid item xs={6} md={2}><StatCard label="Quá hạn" value={s.overdue} icon="!"/></Grid>
   <Grid item xs={6} md={2}><StatCard label="Chưa giao" value={s.unassigned} icon="?"/></Grid>
   <Grid item xs={6} md={2}><StatCard label="WON" value={s.won} icon="✓"/></Grid>
   <Grid item xs={6} md={2}><StatCard label="Win rate" value={`${s.winRate}%`} icon="%"/></Grid>

   <Grid item xs={12} md={6}><Card sx={{height:"100%"}}><CardContent><Typography variant="h6" fontWeight={800}>Hiệu suất theo người phụ trách</Typography>{conversion.byAssignee.length?conversion.byAssignee.map(a=><Box key={a.assigneeId||"none"} sx={{mt:1.5}}><Line label={a.email} value={a.total} detail={`WON ${a.won} · mở ${a.open} · ${a.winRate}%`}/><LinearProgress variant="determinate" value={a.winRate}/></Box>):<Typography color="text.secondary">Chưa có dữ liệu phân công.</Typography>}</CardContent></Card></Grid>
   <Grid item xs={12} md={6}><Card sx={{height:"100%"}}><CardContent><Typography variant="h6" fontWeight={800}>Conversion website</Typography><Grid container spacing={2} sx={{mt:.5}}><Grid item xs={6}><Line label="Call" value={conversion.events.CLICK_PHONE||0}/></Grid><Grid item xs={6}><Line label="Zalo" value={conversion.events.CLICK_ZALO||0}/></Grid><Grid item xs={6}><Line label="Mở báo giá" value={conversion.events.OPEN_QUOTE||0}/></Grid><Grid item xs={6}><Line label="Gửi báo giá" value={conversion.events.SUBMIT_QUOTE||0}/></Grid></Grid></CardContent></Card></Grid>

   <Grid item xs={12} md={4}><Card sx={{height:"100%"}}><CardContent><Typography variant="h6" fontWeight={800}>Landing tạo lead</Typography>{conversion.topLandingPages.map(x=><Line key={x.path} label={x.path} value={x.count}/>)}</CardContent></Card></Grid>
   <Grid item xs={12} md={4}><Card sx={{height:"100%"}}><CardContent><Typography variant="h6" fontWeight={800}>Sản phẩm tạo lead</Typography>{conversion.topProducts.map(x=><Line key={x.product.id} label={`${x.product.name} · ${x.product.sku}`} value={x.count}/>)}</CardContent></Card></Grid>
   <Grid item xs={12} md={4}><Card sx={{height:"100%"}}><CardContent><Typography variant="h6" fontWeight={800}>Nguồn lead</Typography>{conversion.topSources.map(x=><Line key={x.source} label={x.source} value={x.count}/>)}</CardContent></Card></Grid>

   <Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6" fontWeight={800}>Trang được tương tác nhiều</Typography>{conversion.topPaths.map(x=><Line key={x.path} label={x.path} value={x.count}/>)}</CardContent></Card></Grid>
   <Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6" fontWeight={800}>Khách hàng doanh thu cao</Typography>{data.topClients.map(client=><Typography key={client.id}>{client.name} — {client.orders} đơn — {client.revenue.toLocaleString("vi-VN")} ₫</Typography>)}</CardContent></Card></Grid>
  </Grid>
 </Box>;
}
