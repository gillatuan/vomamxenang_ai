import type { Metadata } from "next";
import NextLink from "next/link";
import { Box, Button, Card, CardContent, CardMedia, Container, Grid, Stack, Typography } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { homeDesign } from "@/app/home-design";
import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { SeoBreadcrumbs } from "@/components/SeoBreadcrumbs";
import { publicCases } from "@/lib/case-studies";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Công việc đã làm | Võ Mâm Xe Nâng",
  description: "Các công việc ép, thay vỏ và xử lý vỏ mâm xe nâng thực tế đã thực hiện.",
  alternates: { canonical: "/cong-viec-da-lam" },
};

export default async function Page() {
  const rows = await publicCases();
  return <><PublicHeader/><Box component="main" sx={{ bgcolor: homeDesign.colors.surface, py: { xs: 5, md: 9 } }}>
    <Container maxWidth={false} sx={{ maxWidth: homeDesign.containerWidth }}>
      <SeoBreadcrumbs items={[{ name: "Trang chủ", path: "/" }, { name: "Công việc đã làm", path: "/cong-viec-da-lam" }]}/>
      <Typography sx={{ mt: 3, color: homeDesign.colors.accent, fontSize: ".8rem", fontWeight: 800, letterSpacing: ".12em", lineHeight: 1.5 }}>DỰ ÁN & CÔNG VIỆC THỰC TẾ</Typography>
      <Typography component="h1" sx={{ mt: 1.5, color: homeDesign.colors.ink, fontSize: { xs: "2.1rem", md: "3.2rem" }, fontWeight: 750, letterSpacing: "-.035em", lineHeight: 1.15 }}>Công việc đã làm</Typography>
      <Typography sx={{ mt: 2.5, maxWidth: 760, color: homeDesign.colors.muted, fontSize: { xs: "1rem", md: "1.075rem" }, lineHeight: 1.75 }}>Hình ảnh và thông tin từ các công việc ép, thay vỏ và xử lý vỏ mâm xe nâng thực tế, được đăng sau khi kiểm tra nội dung.</Typography>
      <Grid container spacing={{ xs: 2.5, md: 3 }} sx={{ mt: { xs: 3, md: 5 } }}>
        {rows.map(x => <Grid item xs={12} sm={6} md={4} key={x.id}>
          <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 3, borderColor: homeDesign.colors.border, bgcolor: "#fff", overflow: "hidden", transition: "transform .2s, box-shadow .2s", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 14px 32px rgba(23,50,77,.1)" } }}>
            {(x.afterImageUrl || x.beforeImageUrl) && <CardMedia component="img" height="240" image={x.afterImageUrl || x.beforeImageUrl} alt={x.title} sx={{ objectFit: "cover" }}/>}
            <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column", "&:last-child": { pb: 3 } }}>
              <Typography component="h2" sx={{ color: homeDesign.colors.ink, fontSize: "1.3rem", fontWeight: 750, lineHeight: 1.35 }}>{x.title}</Typography>
              {[x.tireSize, x.serviceType, x.area].filter(Boolean).length > 0 && <Typography sx={{ color: homeDesign.colors.muted, mt: 1.5, fontSize: ".875rem", lineHeight: 1.6 }}>{[x.tireSize, x.serviceType, x.area].filter(Boolean).join(" · ")}</Typography>}
              {x.summary && <Typography sx={{ color: homeDesign.colors.muted, mt: 2, lineHeight: 1.75 }}>{x.summary}</Typography>}
              <Box sx={{ mt: "auto", pt: 3 }}><Button component={NextLink} href={`/cong-viec-da-lam/${x.slug}`} endIcon={<ArrowForwardIcon/>} variant="outlined" sx={{ borderRadius: 2, color: homeDesign.colors.ink, borderColor: homeDesign.colors.border, fontWeight: 700 }}>Xem công việc</Button></Box>
            </CardContent>
          </Card>
        </Grid>)}
      </Grid>
      {!rows.length && <Box sx={{ mt: 5, p: { xs: 3, md: 5 }, bgcolor: "#fff", border: `1px solid ${homeDesign.colors.border}`, borderRadius: 3 }}><Typography sx={{ color: homeDesign.colors.muted, lineHeight: 1.75 }}>Công việc thực tế sẽ xuất hiện tại đây sau khi được xác minh và xuất bản.</Typography><Stack direction="row" spacing={2} sx={{ mt: 2 }}><Button component={NextLink} href="/services" variant="outlined">Xem dịch vụ</Button></Stack></Box>}
    </Container>
  </Box><Footer/></>;
}
