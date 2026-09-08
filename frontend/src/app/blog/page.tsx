"use client";
import { richTextPlain } from "@/lib/rich-text";

import { Box, Button, Card, CardContent, CircularProgress, Container, Grid, Typography } from "@mui/material";
import NextLink from "next/link";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { postsAPI, Post } from "@/lib/api-client";

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    postsAPI
      .getAll()
      .then((res) => {
        setPosts(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load posts");
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      <Container component="main" maxWidth={false} sx={{ maxWidth: 1440, py: { xs: 6, md: 10 } }}>
        <Typography sx={{ fontSize: ".68rem", letterSpacing: ".16em", fontWeight: 800, color: "secondary.main", mb: 1 }}>KIẾN THỨC VẬN HÀNH</Typography>
        <Typography component="h1" variant="h2" sx={{ mb: 5 }}>Câu chuyện từ xưởng và đội xe.</Typography>

        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: "transparent" }}>
                {post.videoUrl && (
                  <Box
                    sx={{
                      width: "100%",
                      paddingBottom: "56.25%",
                      position: "relative",
                      backgroundColor: "#e9e5dc",
                    }}
                  >
                    <iframe
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        border: "none",
                      }}
                      src={post.videoUrl.replace("watch?v=", "embed/")}
                      allowFullScreen
                    />
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1, px: 0, pt: 2.25 }}>
                  <Typography variant="h6" sx={{ marginBottom: "0.75rem", fontWeight: 600 }}>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {richTextPlain(post.content).substring(0, 100)}...
                  </Typography>
                  <Button component={NextLink} href={`/blog/${post.slug || post.id}`} variant="text" sx={{ px: 0, mt: 2, color: "#1a1a1a", textDecoration: "underline", textUnderlineOffset: "4px" }}>Đọc thêm</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
      <Footer />
    </>
  );
}
