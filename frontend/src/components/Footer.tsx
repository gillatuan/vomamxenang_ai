"use client";

import { useEffect, useState } from "react";
import { Box, Button, Container, Grid, Link, Stack, Typography } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import { storeInfoAPI, type PublicStoreInfo } from "@/lib/api-client";

const fallbackStoreInfo = {
  name: "Võ Mâm Xe Nâng",
  phone: "0913.600.210",
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
        backgroundColor: "#FFF7ED",
        color: "text.primary",
        borderTop: "2px solid",
        borderColor: "primary.main",
        padding: { xs: "3.5rem 0 2rem", md: "5rem 0 2rem" },
        marginTop: 0,
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: 1440 }}>
        <Typography sx={{ fontWeight: 800, letterSpacing: ".12em", fontSize: "1.1rem", mb: 5, color: "primary.main" }}>VÕ MÂM XE NÂNG</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography component="h2" variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: "primary.main" }}>Về chúng tôi</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
              {about}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography component="h2" variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: "primary.main" }}>Liên hệ</Typography>
            {storeInfo.email && <Button component="a" href={`mailto:${storeInfo.email}`} variant="text" startIcon={<EmailOutlinedIcon />} sx={{justifyContent:"flex-start",px:0,color:"text.primary","&:hover":{color:"primary.main",bgcolor:"transparent"}}}>{storeInfo.email}</Button>}
            {storeInfo.phone && <Stack spacing={.5}><Button component="a" href={`tel:${storeInfo.phone.replace(/\\s/g,"")}`} variant="text" startIcon={<PhoneOutlinedIcon />} sx={{justifyContent:"flex-start",px:0,color:"text.primary","&:hover":{color:"primary.main",bgcolor:"transparent"}}}>{storeInfo.phone}</Button><Typography variant="body2" color="text.secondary">09777 5 7 9 11 - Tuấn</Typography></Stack>}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography component="h2" variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: "primary.main" }}>Theo dõi</Typography>
            <Typography variant="body2" color="text.secondary">
              {storeInfo.facebookUrl ? (
                <Button component="a" href={storeInfo.facebookUrl} target="_blank" rel="noreferrer" variant="outlined" startIcon={<FacebookOutlinedIcon />} sx={{borderColor:"primary.main",color:"primary.main","&:hover":{borderColor:"primary.main",bgcolor:"rgba(237,108,2,.08)"}}}>Facebook</Button>
              ) : "Facebook"}
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="body2" sx={{ marginTop: { xs: 5, md: 7 }, pt: 2, borderTop: "1px solid", borderColor: "rgba(237,108,2,.28)", color: "text.secondary", fontSize: ".75rem" }}>
          © {new Date().getFullYear()} {storeInfo.name || fallbackStoreInfo.name}. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
