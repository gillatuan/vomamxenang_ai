"use client";
import RichTextContent from "@/components/RichTextContent";

import { Avatar, Box, Card, CardContent, CircularProgress, Container, Divider, Rating, Stack, Typography } from "@mui/material";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "@/components/Footer";
import { PublicHeader } from "@/components/PublicHeader";
import { Post, postsAPI } from "@/lib/api-client";

const comments = [
  { name: "Quốc Hùng", text: "Thông tin rất hữu ích, cảm ơn đội ngũ đã chia sẻ." },
  { name: "Garage Thành Công", text: "Chúng tôi đã áp dụng và kiểm tra xe hiệu quả hơn." },
];

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { postsAPI.getOne(id).then((res) => setPost(res.data)).catch(() => setPost(null)).finally(() => setLoading(false)); }, [id]);
  if (loading) return <Box sx={{ display: "grid", minHeight: "60vh", placeItems: "center" }}><CircularProgress /></Box>;
  if (!post) return <><PublicHeader /><Container sx={{ py: 8 }}><Typography>Không tìm thấy bài viết.</Typography></Container></>;
  const embedUrl = post.videoUrl?.replace("watch?v=", "embed/");
  return <><PublicHeader /><Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
    <Typography variant="h3" fontWeight={700}>{post.title}</Typography>
    <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Chia sẻ kiến thức về lốp và mâm xe nâng</Typography>
    {embedUrl && <Box sx={{ position: "relative", pt: "56.25%", mb: 4, borderRadius: 2, overflow: "hidden" }}><Box component="iframe" src={embedUrl} title={post.title} allowFullScreen sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} /></Box>}
    <RichTextContent value={post.content} />
    <Divider sx={{ my: 5 }} />
    <Typography variant="h5" fontWeight={700} gutterBottom>Bình luận</Typography>
    <Stack spacing={2}>{comments.map((comment) => <Card key={comment.name} variant="outlined"><CardContent><Stack direction="row" spacing={1} alignItems="center"><Avatar>{comment.name[0]}</Avatar><Box><Typography fontWeight={700}>{comment.name}</Typography><Rating value={5} size="small" readOnly /></Box></Stack><Typography sx={{ mt: 1 }}>{comment.text}</Typography></CardContent></Card>)}</Stack>
  </Container><Footer /></>;
}
