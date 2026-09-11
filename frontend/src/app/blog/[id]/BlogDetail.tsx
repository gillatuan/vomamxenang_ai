"use client";
import RichTextContent from "@/components/RichTextContent";

import { Box, Container, Typography } from "@mui/material";
import { Footer } from "@/components/Footer";
import { PublicHeader } from "@/components/PublicHeader";
import { Post } from "@/lib/api-client";

export default function BlogDetailPage({ post, related, breadcrumbs }: { post: Post; related?: React.ReactNode; breadcrumbs?: React.ReactNode }) {
  const embedUrl = post.videoUrl?.replace("watch?v=", "embed/");
  return <><PublicHeader /><Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
    {breadcrumbs}
    <Typography component="h1" variant="h3" fontWeight={700}>{post.title}</Typography>
    <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Chia sẻ kiến thức về lốp và mâm xe nâng</Typography>
    {embedUrl && <Box sx={{ position: "relative", pt: "56.25%", mb: 4, borderRadius: 2, overflow: "hidden" }}><Box component="iframe" src={embedUrl} title={post.title} allowFullScreen sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} /></Box>}
    {post.seo?.imageUrl && <Box component="img" src={post.seo.imageUrl} alt={post.seo.imageAlt || post.title} sx={{ width: "100%", height: "auto", mb: 3, borderRadius: 2 }} />}
    <RichTextContent value={post.content} />
    {related}
  </Container><Footer /></>;
}
