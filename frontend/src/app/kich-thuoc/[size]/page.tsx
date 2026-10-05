import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { Box, Button, Card, CardContent, Chip, Container, Grid, Stack, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { SeoBreadcrumbs } from "@/components/SeoBreadcrumbs";
import { ProductImage } from "@/components/ProductImage";
import { getPublicProducts } from "@/lib/public-seo";
import { productsForSize } from "@/lib/seo/size-seo";
import { productFallbackImage } from "@/lib/product-content";
import { SizeConversion } from "./size-conversion";

export const dynamic = "force-dynamic";
async function data(slug:string){const products=await getPublicProducts();return productsForSize(products,slug);}
export async function generateMetadata({params}:{params:{size:string}}):Promise<Metadata>{
 const products=await data(params.size); if(!products.length)return {title:"Kích thước không tồn tại",robots:{index:false,follow:false}};
 const size=products[0].size!; const path=`/kich-thuoc/${params.size}`;
 return {title:`Vỏ xe nâng ${size} | Sản phẩm & báo giá`,description:`Xem các sản phẩm vỏ xe nâng kích thước ${size} đang có trong catalog. So sánh loại vỏ, thương hiệu, tình trạng hàng và yêu cầu báo giá.`,alternates:{canonical:path},openGraph:{title:`Vỏ xe nâng ${size}`,description:`Sản phẩm vỏ xe nâng ${size}, thông tin hàng và tư vấn lựa chọn.`,url:path}};
}
export default async function Page({params}:{params:{size:string}}){const products=await data(params.size);if(!products.length)notFound();const size=products[0].size!;
 const types=[...new Set(products.map(p=>p.tireType).filter(Boolean))];
 return <><PublicHeader/><Box component="main" sx={{py:{xs:4,md:7}}}><Container>
 <SeoBreadcrumbs items={[{name:"Trang chủ",path:"/"},{name:"Sản phẩm",path:"/products"},{name:`Kích thước ${size}`,path:`/kich-thuoc/${params.size}`}]}/>
 <Typography color="primary" fontWeight={800} letterSpacing=".1em">KÍCH THƯỚC VỎ XE NÂNG</Typography>
 <Typography component="h1" variant="h2" fontWeight={800} sx={{mt:1}}>Vỏ xe nâng {size}</Typography>
 <Typography variant="h6" color="text.secondary" sx={{mt:2,maxWidth:850,lineHeight:1.7}}>Các sản phẩm dưới đây được lấy trực tiếp từ catalog theo kích thước <b>{size}</b>. Hãy đối chiếu thông số trên vỏ và mâm hiện tại trước khi đặt; cùng một model xe có thể dùng cấu hình bánh khác nhau.</Typography>
 <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{mt:3}}>{types.map(t=><Chip key={t} label={t==="SOLID"?"Vỏ đặc":t==="PNEUMATIC"?"Vỏ hơi":t==="NON_MARKING"?"Non-marking":t}/>)}</Stack>
 <Typography component="h2" variant="h4" fontWeight={800} sx={{mt:6,mb:2}}>Sản phẩm {size} trong catalog</Typography>
 <Grid container spacing={3}>{products.map(p=>{const qty=(p.stocks||[]).reduce((s,x)=>s+Math.max(0,x.quantity||0),0);const availability=qty<=0?"Liên hệ kiểm tra hàng":qty<=(p.minStock??5)?"Sắp hết hàng":"Có hàng";return <Grid item xs={12} sm={6} md={4} key={p.id}><Card variant="outlined" sx={{height:"100%",display:"flex",flexDirection:"column"}}><ProductImage src={p.imageUrl} alt={p.seo?.imageAlt||p.name} watermark="Võ Mâm Xe Nâng" fallbackSrc={productFallbackImage(p)} imageSx={{height:220}}/><CardContent sx={{display:"flex",flexDirection:"column",flex:1}}><Typography variant="h6" fontWeight={800}>{p.name}</Typography><Typography color="text.secondary" sx={{mt:1}}>{p.brand||"Thương hiệu liên hệ"} · {p.condition==="USED"?"Cũ / lướt":"Mới"}</Typography><Chip size="small" label={availability} color={qty>0?(qty<=(p.minStock??5)?"warning":"success"):"default"} sx={{mt:2,alignSelf:"flex-start"}}/><Typography color="primary" fontWeight={800} sx={{mt:2}}>{p.sellingPrice?`${p.sellingPrice.toLocaleString("vi-VN")} ₫`:"Liên hệ báo giá"}</Typography><Button component={NextLink} href={`/products/${encodeURIComponent(p.slug||p.id)}`} endIcon={<ArrowForwardIcon/>} sx={{mt:"auto",pt:2,alignSelf:"flex-start"}}>Xem chi tiết</Button></CardContent></Card></Grid>})}</Grid>
 <Card variant="outlined" sx={{mt:5}}><CardContent><Typography component="h2" variant="h4" fontWeight={800}>Chọn vỏ xe nâng {size} như thế nào?</Typography><Typography color="text.secondary" sx={{mt:2,lineHeight:1.8}}>Kích thước là bước lọc đầu tiên, nhưng chưa đủ để xác nhận tương thích. Cần kiểm tra loại vỏ, cấu hình mâm, tình trạng bánh hiện tại và điều kiện vận hành. Nếu chưa chắc, hãy gửi ảnh thông số trên hông vỏ và ảnh mâm để đối chiếu.</Typography></CardContent></Card>
 <SizeConversion size={size}/></Container></Box><Footer/></>;
}
