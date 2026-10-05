import NextLink from "next/link";
import { Box, Button, Card, CardContent, Container, Grid, Stack, Typography } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import TireRepairIcon from "@mui/icons-material/TireRepair";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { SeoBreadcrumbs } from "@/components/SeoBreadcrumbs";
export default function ServicesPage(){return <><PublicHeader/><Box component="main" sx={{py:{xs:4,md:7}}}><Container>
<SeoBreadcrumbs items={[{name:"Trang chủ",path:"/"},{name:"Dịch vụ",path:"/services"}]}/>
<Typography color="primary" fontWeight={800} letterSpacing=".12em">DỊCH VỤ VỎ & MÂM XE NÂNG</Typography>
<Typography component="h1" variant="h2" fontWeight={800} sx={{mt:1,maxWidth:850}}>Hỗ trợ từ chọn đúng vỏ đến ép và thay bánh xe nâng.</Typography>
<Typography color="text.secondary" variant="h6" sx={{mt:2,maxWidth:800,lineHeight:1.7}}>Gửi kích thước, model xe hoặc ảnh bánh hiện tại để chúng tôi đối chiếu trước khi báo giá. Thông tin tương thích chỉ được xác nhận sau khi kiểm tra thực tế.</Typography>
<Grid container spacing={3} sx={{mt:3}}>
<Grid item xs={12} md={6}><Card variant="outlined" sx={{height:"100%"}}><CardContent><BuildIcon color="primary"/><Typography variant="h5" fontWeight={800} sx={{my:1}}>Ép vỏ xe nâng</Typography><Typography color="text.secondary">Tư vấn và ép vỏ/mâm theo kích thước thực tế, bao gồm nhu cầu thay vỏ mới hoặc xử lý bộ bánh khách mang tới.</Typography><Button component={NextLink} href="/services/ep-vo-xe-nang" endIcon={<ArrowForwardIcon/>} sx={{mt:2}}>Xem dịch vụ</Button></CardContent></Card></Grid>
<Grid item xs={12} md={6}><Card variant="outlined" sx={{height:"100%"}}><CardContent><TireRepairIcon color="primary"/><Typography variant="h5" fontWeight={800} sx={{my:1}}>Thay vỏ xe nâng</Typography><Typography color="text.secondary">Đối chiếu size, loại vỏ và điều kiện vận hành trước khi lựa chọn phương án thay phù hợp.</Typography><Button component={NextLink} href="/services/thay-vo-xe-nang" endIcon={<ArrowForwardIcon/>} sx={{mt:2}}>Xem dịch vụ</Button></CardContent></Card></Grid>
</Grid></Container></Box><Footer/></>}
