import NextLink from "next/link";
import { Box, Button, Card, CardContent, Container, Grid, Stack, Typography } from "@mui/material";
import BuildIcon from "@mui/icons-material/Build";
import TireRepairIcon from "@mui/icons-material/TireRepair";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { homeDesign } from "@/app/home-design";
import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { SeoBreadcrumbs } from "@/components/SeoBreadcrumbs";
import { ServiceConversion } from "@/components/ServiceConversion";

const services = [
  { title: "Ép vỏ xe nâng", description: "Tư vấn và ép vỏ/mâm theo kích thước thực tế, bao gồm nhu cầu thay vỏ mới hoặc xử lý bộ bánh khách mang tới.", href: "/services/ep-vo-xe-nang", Icon: BuildIcon },
  { title: "Thay vỏ xe nâng", description: "Đối chiếu size, loại vỏ và điều kiện vận hành trước khi lựa chọn phương án thay phù hợp.", href: "/services/thay-vo-xe-nang", Icon: TireRepairIcon },
];
const steps = ["Gửi kích thước hoặc ảnh bánh hiện tại", "Đối chiếu vỏ, mâm và nhu cầu vận hành", "Xác nhận phương án và báo giá", "Tiến hành dịch vụ sau khi thống nhất"];

export default function ServicesPage() {
  return <><PublicHeader/><Box component="main" sx={{ bgcolor: homeDesign.colors.surface, py: { xs: 5, md: 9 } }}>
    <Container maxWidth={false} sx={{ maxWidth: homeDesign.containerWidth }}>
      <SeoBreadcrumbs items={[{ name: "Trang chủ", path: "/" }, { name: "Dịch vụ", path: "/services" }]}/>
      <Typography sx={{ mt: 3, color: homeDesign.colors.accent, fontSize: ".8rem", fontWeight: 800, letterSpacing: ".12em", lineHeight: 1.5 }}>DỊCH VỤ VỎ & MÂM XE NÂNG</Typography>
      <Typography component="h1" sx={{ mt: 1.5, maxWidth: 900, color: homeDesign.colors.ink, fontSize: { xs: "2.1rem", md: "3.2rem" }, fontWeight: 750, letterSpacing: "-.035em", lineHeight: 1.15 }}>Giải pháp ép và thay vỏ xe nâng phù hợp từng nhu cầu.</Typography>
      <Typography sx={{ mt: 2.5, maxWidth: 760, color: homeDesign.colors.muted, fontSize: { xs: "1rem", md: "1.075rem" }, lineHeight: 1.75 }}>Gửi kích thước, model xe hoặc ảnh bánh hiện tại để chúng tôi đối chiếu trước khi báo giá. Thông tin tương thích chỉ được xác nhận sau khi kiểm tra thực tế.</Typography>
      <Grid container spacing={3} sx={{ mt: { xs: 3, md: 5 } }}>
        {services.map(({ title, description, href, Icon }) => <Grid item xs={12} md={6} key={href}>
          <Card variant="outlined" sx={{ height: "100%", borderColor: homeDesign.colors.border, borderRadius: 3, bgcolor: "#fff", boxShadow: "none", transition: "transform .2s, box-shadow .2s", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 14px 32px rgba(23,50,77,.1)" } }}>
            <CardContent sx={{ p: { xs: 3, md: 4 }, "&:last-child": { pb: { xs: 3, md: 4 } } }}>
              <Box sx={{ width: 56, height: 56, display: "grid", placeItems: "center", borderRadius: 2, bgcolor: homeDesign.colors.surface, color: homeDesign.colors.ink, mb: 3 }}><Icon fontSize="large"/></Box>
              <Typography component="h2" sx={{ color: homeDesign.colors.ink, fontSize: { xs: "1.4rem", md: "1.65rem" }, fontWeight: 750, lineHeight: 1.3 }}>{title}</Typography>
              <Typography sx={{ color: homeDesign.colors.muted, mt: 2, lineHeight: 1.75, minHeight: { md: 86 } }}>{description}</Typography>
              <Button component={NextLink} href={href} endIcon={<ArrowForwardIcon/>} variant="outlined" sx={{ mt: 3, borderRadius: 2, borderColor: homeDesign.colors.border, color: homeDesign.colors.ink }}>Xem dịch vụ</Button>
            </CardContent>
          </Card>
        </Grid>)}
      </Grid>
      <Box component="section" sx={{ mt: { xs: 7, md: 11 } }}>
        <Typography sx={{ color: homeDesign.colors.accent, fontSize: ".8rem", fontWeight: 800, letterSpacing: ".12em" }}>QUY TRÌNH TƯ VẤN</Typography>
        <Typography component="h2" sx={{ mt: 1.5, mb: 3, color: homeDesign.colors.ink, fontSize: { xs: "1.85rem", md: "2.8rem" }, fontWeight: 750, letterSpacing: "-.035em", lineHeight: 1.2 }}>Từ thông số bánh đến phương án thực hiện.</Typography>
        <Grid container spacing={2.5}>{steps.map((step, i) => <Grid item xs={12} sm={6} md={3} key={step}><Box sx={{ p: 3, height: "100%", bgcolor: "#fff", border: `1px solid ${homeDesign.colors.border}`, borderRadius: 3 }}><Typography sx={{ color: homeDesign.colors.accent, fontWeight: 800, mb: 2 }}>0{i + 1}</Typography><Typography sx={{ color: homeDesign.colors.ink, fontWeight: 700, lineHeight: 1.55 }}>{step}</Typography></Box></Grid>)}</Grid>
      </Box>
      <Box component="section" sx={{ mt: { xs: 7, md: 10 }, p: { xs: 3, md: 5 }, bgcolor: "#fff", border: `1px solid ${homeDesign.colors.border}`, borderRadius: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} justifyContent="space-between" spacing={3}>
          <Box><Typography component="h2" sx={{ color: homeDesign.colors.ink, fontSize: { xs: "1.5rem", md: "2rem" }, fontWeight: 750, lineHeight: 1.3 }}>Cần tư vấn ép hoặc thay vỏ?</Typography><Typography sx={{ mt: 1.5, color: homeDesign.colors.muted, lineHeight: 1.75 }}>Gửi hình ảnh và kích thước bánh để được đối chiếu trước khi thực hiện.</Typography></Box>
          <Button component={NextLink} href="/cong-viec-da-lam" variant="outlined" sx={{ borderRadius: 2, whiteSpace: "nowrap" }}>Xem công việc thực tế</Button>
        </Stack>
        <ServiceConversion service="Tư vấn dịch vụ vỏ mâm xe nâng"/>
      </Box>
    </Container>
  </Box><Footer/></>;
}
