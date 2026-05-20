"use client";

import { Box, Container, Typography, Grid, Card, CardContent, CardActions, Button, CircularProgress } from "@mui/material";
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
        setPosts(res.data.filter((p) => p.published));
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load posts");
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      <Container sx={{ padding: "4rem 0" }}>
        <Typography variant="h4" sx={{ marginBottom: "2rem", fontWeight: "bold" }}>
          Blog
        </Typography>

        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}

        <Grid container spacing={2}>
          {posts.map((post) => (
            <Grid item xs={12} sm={6} md={4} key={post.id}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                {post.videoUrl && (
                  <Box
                    sx={{
                      width: "100%",
                      paddingBottom: "56.25%",
                      position: "relative",
                      backgroundColor: "#f0f0f0",
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
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ marginBottom: "0.5rem" }}>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {post.content.substring(0, 100)}...
                  </Typography>
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
