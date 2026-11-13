"use client";
import { homeDesign } from "@/app/home-design";

import { useEffect, useState } from "react";
import { Box, Button, Container, Grid, Stack, Typography } from "@mui/material";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import FacebookOutlinedIcon from "@mui/icons-material/FacebookOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
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
        backgroundColor: homeDesign.colors.ink,
        color: "#fff",
        borderTop: `3px solid ${homeDesign.colors.accent}`,
        padding: { xs: "3.5rem 0 2rem", md: "5rem 0 2rem" },
        marginTop: 0,
      }}
    >
      <Container maxWidth={false} sx={{ maxWidth: homeDesign.containerWidth }}>
        <Typography sx={{ fontWeight: 800, letterSpacing: ".12em", fontSize: "1.1rem", mb: 5, color: homeDesign.colors.accent }}>{storeInfo.name || fallbackStoreInfo.name}</Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography component="h2" variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: homeDesign.colors.accent }}>Về chúng tôi</Typography>
            <Typography variant="body2" sx={{ color:"rgba(255,255,255,.78)",lineHeight:1.75 }}>
              {about}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography component="h2" variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: homeDesign.colors.accent }}>Liên hệ</Typography>
            {storeInfo.address && <Typography variant="body2" sx={{ mb: 1.2, lineHeight: 1.6 }}><Box component="a" href={storeInfo.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(storeInfo.address)}`} target="_blank" rel="noopener noreferrer" aria-label={`Mở Google Maps: ${storeInfo.address}`} sx={{ display: "inline-flex", alignItems: "flex-start", gap: .7, color: "rgba(255,255,255,.9)", textDecoration: "underline", textUnderlineOffset: "3px", "&:hover": { color: homeDesign.colors.accent } }}><LocationOnOutlinedIcon sx={{ fontSize: 17, mt: .3, flexShrink: 0 }} />{storeInfo.address}</Box></Typography>}
            {storeInfo.email && <Button component="a" href={`mailto:${storeInfo.email}`} variant="text" startIcon={<EmailOutlinedIcon />} sx={{justifyContent:"flex-start",fontSize:"0.875rem",px:0,color:"rgba(255,255,255,.78)","&:hover":{color:homeDesign.colors.accent,bgcolor:"transparent"}}}>{storeInfo.email}</Button>}
            {storeInfo.phone && (
              <Stack spacing={.5}>
                <Button component="a" href={`tel:${storeInfo.phone.replace(/[^\d+]/g,"")}`} variant="text" startIcon={<PhoneOutlinedIcon />} sx={{justifyContent:"flex-start",fontSize:"0.875rem",px:0,color:"rgba(255,255,255,.78)","&:hover":{color:homeDesign.colors.accent,bgcolor:"transparent"}}}>{storeInfo.phone}</Button>
                <Button component="a" href={`tel:0977757911`} variant="text" startIcon={<PhoneOutlinedIcon />} sx={{justifyContent:"flex-start",fontSize:"0.875rem",px:0,color:"rgba(255,255,255,.78)","&:hover":{color:homeDesign.colors.accent,bgcolor:"transparent"}}}>09 777 5 7 9 11 - Tuấn</Button>
              </Stack>
            )}
            {storeInfo.googleMapsUrl && <Button component="a" href={storeInfo.googleMapsUrl} target="_blank" rel="noopener noreferrer" variant="text" startIcon={<LocationOnOutlinedIcon />} sx={{justifyContent:"flex-start",fontSize:"0.875rem",px:0,color:"rgba(255,255,255,.78)","&:hover":{color:homeDesign.colors.accent,bgcolor:"transparent"}}}>Google Maps</Button>}
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography component="h2" variant="h6" sx={{ mb: 1.5, fontWeight: 600, color: homeDesign.colors.accent }}>Theo dõi</Typography>
            <Typography variant="body2" sx={{color:"rgba(255,255,255,.78)"}}>
              {storeInfo.facebookUrl ? (
                <Button component="a" href={storeInfo.facebookUrl} target="_blank" rel="noreferrer" variant="outlined" startIcon={<FacebookOutlinedIcon />} sx={{borderColor:homeDesign.colors.accent,color:homeDesign.colors.accent,"&:hover":{borderColor:homeDesign.colors.accent,bgcolor:"rgba(255,255,255,.08)"}}}>Facebook</Button>
              ) : "Facebook"}
            </Typography>
          </Grid>
        </Grid>
        <Typography variant="body2" sx={{ marginTop: { xs: 5, md: 7 }, pt: 2, borderTop: "1px solid", borderColor: "rgba(255,255,255,.18)", color: "rgba(255,255,255,.78)", fontSize: ".875rem" }}>
          © {new Date().getFullYear()} {storeInfo.name || fallbackStoreInfo.name}. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
