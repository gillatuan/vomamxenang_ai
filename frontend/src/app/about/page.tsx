"use client";

import { useEffect, useState } from "react";
import { Box, Container, Typography } from "@mui/material";
import { PublicHeader } from "@/components/PublicHeader";
import { Footer } from "@/components/Footer";
import { aboutAPI, type AboutPage } from "@/lib/api-client";

const fallbackAbout: Pick<AboutPage, "title" | "summary" | "content"> = {
  title: "Về Võ Mâm Xe Nâng",
  summary: "Chúng tôi cung cấp lốp, mâm và dịch vụ bảo dưỡng xe nâng, giúp doanh nghiệp vận hành an toàn, bền bỉ và hiệu quả.",
  content: "Võ Mâm Xe Nâng chuyên cung cấp lốp, mâm và phụ tùng xe nâng chất lượng cao. Chúng tôi tư vấn giải pháp phù hợp với điều kiện vận hành thực tế của từng khách hàng.",
};

export default function AboutPage() {
  const [about, setAbout] = useState<Partial<AboutPage>>(fallbackAbout);

  useEffect(() => {
    aboutAPI.getPublic().then(({ data }) => {
      if (data) setAbout(data);
    }).catch(() => undefined);
  }, []);

  return <>
    <PublicHeader />
    <Box component="main" sx={{ backgroundColor: "#fff8f1", py: { xs: 5, md: 9 }, minHeight: "55vh" }}>
      <Container maxWidth="md">
        <Typography component="h1" variant="h3" fontWeight={800} sx={{ color: "#5d3416", mb: 2 }}>
          {about.title || fallbackAbout.title}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.7, mb: 4 }}>
          {about.summary || fallbackAbout.summary}
        </Typography>
        {about.imageUrl && <Box component="img" src={about.imageUrl} alt={about.title || fallbackAbout.title} sx={{ width: "100%", maxHeight: 420, objectFit: "cover", borderRadius: 3, mb: 4 }} />}
        <Typography component="div" sx={{ whiteSpace: "pre-line", lineHeight: 1.9, fontSize: "1.05rem" }}>
          {about.content || fallbackAbout.content}
        </Typography>
      </Container>
    </Box>
    <Footer />
  </>;
}
