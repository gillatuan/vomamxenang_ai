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
        backgroundColor: "#333",
        color: "white",
        padding: "2rem 0",
        marginTop: "4rem",
      }}
    >
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6">Về chúng tôi</Typography>
            <Typography variant="body2">
              {about}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6">Liên hệ</Typography>
            {storeInfo.email && <Typography variant="body2">Email: {storeInfo.email}</Typography>}
            {storeInfo.phone && <Typography variant="body2">Phone: {storeInfo.phone}</Typography>}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6">Theo dõi</Typography>
            <Typography variant="body2">
              {storeInfo.facebookUrl ? (
                <Link href={storeInfo.facebookUrl} target="_blank" rel="noreferrer" color="inherit" underline="hover">
                  Facebook
                </Link>
              ) : "Facebook"} {"| Instagram | YouTube"}
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="body2" sx={{ marginTop: "2rem", textAlign: "center" }}>
          © {new Date().getFullYear()} {storeInfo.name || fallbackStoreInfo.name}. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
