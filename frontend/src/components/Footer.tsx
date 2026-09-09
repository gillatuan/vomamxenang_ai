"use client";

import { useEffect, useState } from "react";
import { Box, Container, Grid, Link, Typography } from "@mui/material";
import { storeInfoAPI, type PublicStoreInfo } from "@/lib/api-client";

const fallbackStoreInfo = {
  name: "Võ Mâm Xe Nâng",
  phone: "0905 123 456",
  email: "info@vomamxenang.com",
  notes: "Chuyên cung cấp lốp và phụ tùng xe nâng chất lượng cao từ các nhà sản xuất hàng đầu.",
};

export function Footer() {
  const [storeInfo, setStoreInfo] = useState<Partial<PublicStoreInfo>>(fallbackStoreInfo);

  useEffect(() => {
    let mounted = true;

    storeInfoAPI.getPublic()
      .then(({ data }) => {
        if (mounted && data) setStoreInfo((current) => ({ ...current, ...data }));
      })
      // A footer should remain usable when the API is temporarily unavailable.
      .catch(() => undefined);

    return () => { mounted = false; };
  }, []);

  const about = storeInfo.notes?.split("Theo dõi:")[0].trim() || fallbackStoreInfo.notes;

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#1a1a1a",
        color: "white",
        padding: { xs: "3.5rem 0 2rem", md: "5rem 0 2rem" },
        marginTop: 0,
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: 1440 }}>
        <Typography sx={{ fontWeight: 800, letterSpacing: ".12em", fontSize: ".76rem", mb: 5 }}>VÕ MÂM XE NÂNG</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography component="h2" variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>Về chúng tôi</Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,.7)", lineHeight: 1.7 }}>
              {about}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography component="h2" variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>Liên hệ</Typography>
            {storeInfo.email && <Typography variant="body2" sx={{ color: "rgba(255,255,255,.7)" }}>Email: {storeInfo.email}</Typography>}
            {storeInfo.phone && <Typography variant="body2" sx={{ color: "rgba(255,255,255,.7)", mt: .5 }}>Phone: {storeInfo.phone}</Typography>}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography component="h2" variant="h6" sx={{ mb: 1.5, fontWeight: 600 }}>Theo dõi</Typography>
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,.7)" }}>
              {storeInfo.facebookUrl ? (
                <Link href={storeInfo.facebookUrl} target="_blank" rel="noreferrer" color="inherit" underline="hover">
                  Facebook
                </Link>
              ) : "Facebook"} {"| Instagram | YouTube"}
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="body2" sx={{ marginTop: { xs: 5, md: 7 }, pt: 2, borderTop: "1px solid rgba(255,255,255,.18)", color: "rgba(255,255,255,.55)", fontSize: ".75rem" }}>
          © {new Date().getFullYear()} {storeInfo.name || fallbackStoreInfo.name}. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
