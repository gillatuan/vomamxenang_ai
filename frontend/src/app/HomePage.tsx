"use client";
import { sizeToSlug, uniqueProductSizes } from "@/lib/seo/size-seo";
import { homeDesign } from "./home-design";
import { ContentImage } from "@/components/ContentImage";
import { richTextPlain } from "@/lib/rich-text";
import { productFallbackImage, productSeoDescription } from "@/lib/product-content";

import { useEffect, useState } from "react";
import NextLink from "next/link";
import { Box, Card, CardContent, Container, Typography, Button, Grid, Stack, Rating } from "@mui/material";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { aboutAPI, postsAPI, productsAPI, type AboutPage, type Post, type Product } from "@/lib/api-client";

const fallbackAbout = {
  title: "Về Võ Mâm Xe Nâng",
  summary: "Chúng tôi cung cấp lốp, mâm và dịch vụ bảo dưỡng xe nâng, giúp doanh nghiệp vận hành an toàn, bền bỉ và hiệu quả.",
};
type Review = { id: string; content: string; rating: number | null; product: { id: string; name: string }; reviewerName: string };
const fallbackReviews: Review[] = [
  { id: "review-1", content: "Tư vấn rõ ràng, lốp vận hành ổn định và giao hàng đúng hẹn.", rating: 5, product: { id: "", name: "Khách hàng doanh nghiệp" }, reviewerName: "Khách hàng A." },
  { id: "review-2", content: "Đội ngũ hỗ trợ nhanh, chọn đúng loại lốp cho điều kiện kho xưởng.", rating: 5, product: { id: "", name: "Khách hàng doanh nghiệp" }, reviewerName: "Khách hàng B." },
];

export default function HomePage() {
  const [about, setAbout] = useState<Pick<AboutPage, "title" | "summary">>(fallbackAbout);
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const availableSizes = uniqueProductSizes(products).slice(0, 8);
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);

  useEffect(() => {
    Promise.allSettled([aboutAPI.getPublic(), productsAPI.getAll(), postsAPI.getAll(), productsAPI.featuredReviews()]).then(([aboutResult, productsResult, postsResult, reviewsResult]) => {
      if (aboutResult.status === "fulfilled" && aboutResult.value.data) setAbout({ title: aboutResult.value.data.title, summary: aboutResult.value.data.summary });
      if (productsResult.status === "fulfilled") setProducts(productsResult.value.data.slice(0, 4));
      if (postsResult.status === "fulfilled") setPosts(postsResult.value.data.slice(0, 3));
      if (reviewsResult.status === "fulfilled" && reviewsResult.value.data.length) setReviews(reviewsResult.value.data);
    });
  }, []);

  return (
    <>
      <Header />
      <Box
        component="section"
        sx={{
          position: "relative",
          overflow: "hidden",
          minHeight: { xs: 540, md: 650 },
          display: "flex",
          alignItems: "flex-end",
          color: "#fff",
          background: "linear-gradient(100deg, rgba(15,35,53,.97) 0%, rgba(15,35,53,.91) 48%, rgba(15,35,53,.35) 100%), url(/images/products/tire-rim-service.png) center / cover no-repeat",
          "&:before": { content: '""', position: "absolute", width: { xs: 340, md: 620 }, height: { xs: 340, md: 620 }, border: "1px solid rgba(255,255,255,.25)", borderRadius: "50%", right: { xs: -170, md: -120 }, top: { xs: -130, md: -210 } },
          "&:after": { content: '""', position: "absolute", width: "44%", height: "100%", right: 0, top: 0, opacity: .18, backgroundImage: "repeating-linear-gradient(90deg, #fff 0 1px, transparent 1px 58px)" },
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: 1440, width: "100%", py: { xs: 7, md: 10 }, position: "relative", zIndex: 1 }}>
          <Typography sx={{ fontSize: "1.1rem", letterSpacing: ".18em", fontWeight: 800, mb: 2, color: "#dec19e" }}>VÕ MÂM XE NÂNG · INDUSTRIAL MOBILITY</Typography>
          <Typography component="h1" variant="h1" sx={{ fontSize: { xs: "2.45rem", sm: "3.2rem", md: "4.5rem" }, lineHeight: 1.08, maxWidth: 860, textTransform: "uppercase" }}>
            Vỏ mâm xe nâng.<br />Chọn đúng cho đội xe.
          </Typography>
          <Typography sx={{ maxWidth: 570, mt: 3, mb: 4, fontSize: { xs: "1rem", md: "1.16rem" }, lineHeight: 1.7, color: "rgba(255,255,255,.78)" }}>
            Tìm hiểu vỏ xe nâng, lốp đặc, lốp hơi và mâm bánh xe nâng. Đối chiếu kích thước, cấu hình mâm và điều kiện kho xưởng trước khi lựa chọn.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}><Button component={NextLink} href="/vo-xe-nang" sx={{ bgcolor: homeDesign.colors.accent, color: homeDesign.colors.ink, borderRadius: 2, "&:hover": { bgcolor: "#FBBF24" } }}>Xem vỏ xe nâng</Button><Button component={NextLink} href="/about" variant="outlined" sx={{ borderColor: "rgba(255,255,255,.7)", color: "#fff", "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,.12)" } }}>Về chúng tôi</Button><Button component={NextLink} href="/mam-xe-nang" sx={{ color: "#fff" }}>Tìm mâm xe nâng</Button></Stack>
        </Container>
      </Box>
      <Box component="section" sx={{ bgcolor: homeDesign.colors.surface, py: homeDesign.sectionPadding }}>
        <Container maxWidth={false} sx={{ maxWidth: homeDesign.containerWidth }}>
          <Typography sx={{ fontWeight: 800, color: homeDesign.colors.accent, letterSpacing: ".12em", mb: 1 }}>TÌM ĐÚNG GIẢI PHÁP</Typography>
          <Typography component="h2" variant="h2" sx={{ color: homeDesign.colors.ink, mb: 4 }}>Bạn đang tìm loại vỏ hay mâm xe nâng nào?</Typography>
          <Grid container spacing={3}>
            {homeDesign.categoryLinks.map((category) => (
              <Grid item xs={12} md={4} key={category.href}>
                <Box component={NextLink} href={category.href} sx={{ display: "block", height: "100%", p: { xs: 3, md: 4 }, border: `1px solid ${homeDesign.colors.border}`, borderRadius: 3, bgcolor: "#fff", textDecoration: "none", transition: "transform .2s ease, box-shadow .2s ease", "&:hover": { transform: "translateY(-4px)", boxShadow: "0 14px 32px rgba(23,50,77,.1)" } }}>
                  <Typography component="h3" variant="h5" sx={{ color: homeDesign.colors.ink, mb: 1.5 }}>{category.title}</Typography>
                  <Typography sx={{ color: homeDesign.colors.muted, lineHeight: 1.7 }}>{category.description}</Typography>
                  <Typography sx={{ color: homeDesign.colors.ink, fontWeight: 700, mt: 3 }}>Khám phá →</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          <Typography component="h3" variant="h6" sx={{ mt: 5, mb: 2, color: homeDesign.colors.ink }}>Tìm nhanh theo kích thước phổ biến</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1.5}>
            {availableSizes.map(({ size }) => (
              <Button key={size} component={NextLink} href={`/kich-thuoc/${sizeToSlug(size)}`} variant="outlined" sx={{ borderRadius: 2, color: homeDesign.colors.ink, borderColor: homeDesign.colors.border, bgcolor: "#fff" }}>{size}</Button>
            ))}
          </Stack>
          {!availableSizes.length && <Button component={NextLink} href="/products" variant="outlined" sx={{ mt: 2 }}>Duyệt tất cả kích thước trong catalog</Button>}
        </Container>
      </Box>
      <Container component="section" maxWidth={false} sx={{ maxWidth: 1440, py: { xs: 7, md: 12 } }}>
        <Grid container spacing={{ xs: 4, md: 8 }} alignItems="center"><Grid item xs={12} md={5}><Typography sx={{ fontSize: { xs: "1.1rem", md: "1.1rem" }, letterSpacing: ".16em", fontWeight: 800, mb: 2, color: "secondary.main" }}>GIẢI PHÁP ĐỒNG HÀNH</Typography><Typography component="h2" variant="h2">{about.title}</Typography></Grid><Grid item xs={12} md={7}><Typography color="text.secondary" sx={{ fontSize: { xs: "1.08rem", md: "1.35rem" }, lineHeight: 1.7, maxWidth: 690 }}>{about.summary}</Typography><Button component={NextLink} href="/about" variant="text" sx={{ px: 0, mt: 3, color: "primary.main", bgcolor: "transparent", textDecoration: "none", "&:hover": { bgcolor: "transparent", color: "primary.dark" }, textUnderlineOffset: "6px" }}>Tìm hiểu thêm</Button></Grid></Grid>
      </Container>
      <Container component="section" maxWidth={false} sx={{ maxWidth: 1440, py: { xs: 7, md: 10 } }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "flex-end" }} spacing={2} sx={{ mb: 4 }}><Box><Typography sx={{ fontSize: "1.1rem", letterSpacing: ".16em", fontWeight: 800, color: "secondary.main", mb: 1 }}>LỰA CHỌN NỔI BẬT</Typography><Typography component="h2" variant="h2">Sản phẩm sẵn sàng vận hành.</Typography></Box><Button component={NextLink} href="/products" variant="outlined">Xem tất cả sản phẩm</Button></Stack>
        <Grid container spacing={{ xs: 2, md: 3 }}>{products.map((product) => <Grid item xs={12} sm={6} md={3} key={product.id}><Card sx={{ height: "100%", bgcolor: "transparent", "&:hover img": { transform: "scale(1.04)" } }}><Box sx={{ overflow: "hidden", bgcolor: "#e9e5dc", height: 260 }}><ContentImage src={product.imageUrl} fallbackSrc={productFallbackImage(product)} alt={product.seo?.imageAlt || `${product.name}${product.size ? ` ${product.size}` : ""}`} sx={{ height: "100%", transition: "transform .4s ease" }} /></Box><CardContent sx={{ px: 0, pt: 2 }}><Typography component="h3" variant="h5">{product.name}</Typography><Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.6 }}>{productSeoDescription(product)}</Typography><Typography sx={{ mt: 1.25, fontWeight: 800, color: "secondary.main" }}>{product.sellingPrice ? `${product.sellingPrice.toLocaleString("vi-VN")} ₫` : "Liên hệ báo giá"}</Typography><Button component={NextLink} href={`/products/${product.slug || product.id}`} variant="text" sx={{ px: 0, mt: 1.5, color: "primary.main", bgcolor: "transparent", textDecoration: "none", "&:hover": { bgcolor: "transparent", color: "primary.dark" }, textUnderlineOffset: "4px" }}>Xem chi tiết</Button></CardContent></Card></Grid>)}</Grid>
        {!products.length && <Typography color="text.secondary">Sản phẩm nổi bật đang được cập nhật.</Typography>}
      </Container>
      <Box component="section" sx={{ bgcolor: homeDesign.colors.ink, color: "#fff", py: homeDesign.sectionPadding }}>
        <Container maxWidth={false} sx={{ maxWidth: homeDesign.containerWidth }}>
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ overflow: "hidden", borderRadius: 3, aspectRatio: "4 / 3" }}>
                <ContentImage kind="post" alt="Hình minh họa dịch vụ vỏ và mâm xe nâng" sx={{ height: "100%", objectFit: "cover" }} />
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography sx={{ color: homeDesign.colors.accent, fontWeight: 800, letterSpacing: ".12em", mb: 2 }}>DỊCH VỤ XE NÂNG</Typography>
              <Typography component="h2" variant="h2" sx={{ mb: 3 }}>Ép vỏ, thay vỏ và tư vấn cấu hình mâm.</Typography>
              <Typography sx={{ color: "rgba(255,255,255,.8)", lineHeight: 1.8, mb: 3 }}>Trao đổi kích thước, loại vỏ và tình trạng xe để được hướng dẫn lựa chọn phương án phù hợp.</Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button component={NextLink} href="/services" sx={{ bgcolor: homeDesign.colors.accent, color: homeDesign.colors.ink, borderRadius: 2, "&:hover": { bgcolor: "#FBBF24" } }}>Khám phá dịch vụ</Button>
                <Button component={NextLink} href="/cong-viec-da-lam" variant="outlined" sx={{ color: "#fff", borderColor: "#fff", borderRadius: 2 }}>Công việc thực tế</Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Box component="section" sx={{ bgcolor: "#e9e5dc", py: { xs: 5, md: 7 } }}><Container maxWidth={false} sx={{ maxWidth: 1440 }}><Grid container spacing={3}>{[["01", "Tư vấn đúng tải trọng"], ["02", "Sản phẩm tuyển chọn"], ["03", "Hỗ trợ sau bán hàng"]].map(([number, text]) => <Grid item xs={12} md={4} key={number}><Typography sx={{ color: "secondary.main", fontSize: "1.1rem", letterSpacing: ".16em", fontWeight: 800, mb: 1 }}>{number}</Typography><Typography component="h2" variant="h5" sx={{ fontWeight: 500 }}>{text}</Typography></Grid>)}</Grid></Container></Box>
      <Box component="section" sx={{ bgcolor: "#1a1a1a", color: "#fff", py: { xs: 7, md: 10 } }}><Container maxWidth={false} sx={{ maxWidth: 1440 }}><Typography sx={{ fontSize: "1.1rem", letterSpacing: ".16em", fontWeight: 800, color: "#dec19e", mb: 1 }}>PHẢN HỒI KHÁCH HÀNG</Typography><Typography component="h2" variant="h2" sx={{ maxWidth: 640, mb: 5 }}>Niềm tin được xây từ mỗi ca vận hành.</Typography><Grid container spacing={3}>{reviews.slice(0, 3).map((review) => <Grid item xs={12} md={4} key={review.id}><Box sx={{ height: "100%", borderTop: "1px solid rgba(255,255,255,.35)", pt: 2.5 }}><Rating value={review.rating ?? 0} readOnly size="small" sx={{ mb: 2, "& .MuiRating-iconFilled": { color: "#dec19e" } }} /><Typography sx={{ lineHeight: 1.75, fontSize: "1.04rem", minHeight: { md: 112 } }}>“{review.content}”</Typography><Typography sx={{ mt: 2.5, fontWeight: 700 }}>{review.reviewerName}</Typography><Typography variant="body2" sx={{ color: "rgba(255,255,255,.62)", mt: .5 }}>{review.product.name}</Typography></Box></Grid>)}</Grid></Container></Box>
      <Container component="section" maxWidth={false} sx={{ maxWidth: 1440, py: { xs: 7, md: 10 } }}><Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "flex-end" }} spacing={2} sx={{ mb: 4 }}><Box><Typography sx={{ fontSize: "1.1rem", letterSpacing: ".16em", fontWeight: 800, color: "secondary.main", mb: 1 }}>TỪ BLOG</Typography><Typography component="h2" variant="h2">Kiến thức cho đội xe của bạn.</Typography></Box><Button component={NextLink} href="/blog" variant="outlined">Xem tất cả bài viết</Button></Stack><Grid container spacing={{ xs: 2, md: 3 }}>{posts.map((post) => <Grid item xs={12} md={4} key={post.id}><Card sx={{ height: "100%", bgcolor: "transparent" }}><Box sx={{ height: 200, overflow: "hidden", borderRadius: 2 }}><ContentImage src={post.seo?.imageUrl} kind="post" alt={post.seo?.imageAlt || post.title} sx={{ height: "100%", objectFit: "cover" }} /></Box><CardContent sx={{ px: 0, pt: 2.25 }}><Typography component="h3" variant="h6" sx={{ fontWeight: 600 }}>{post.title}</Typography><Typography color="text.secondary" sx={{ mt: 1, lineHeight: 1.65 }}>{richTextPlain(post.content).slice(0, 120)}…</Typography><Button component={NextLink} href={`/blog/${post.slug || post.id}`} variant="text" sx={{ px: 0, mt: 1.5, color: "primary.main", bgcolor: "transparent", textDecoration: "none", "&:hover": { bgcolor: "transparent", color: "primary.dark" }, textUnderlineOffset: "4px" }}>Đọc bài viết</Button></CardContent></Card></Grid>)}</Grid>{!posts.length && <Typography color="text.secondary">Bài viết nổi bật đang được cập nhật.</Typography>}</Container>

      <Footer />
    </>
  );
}
