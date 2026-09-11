"use client";

import { useEffect, useState } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import { storeInfoAPI } from "@/lib/api-client";

const fallbackStoreName = "Võ Mâm Xe Nâng";

export function useStoreWatermark() {
  const [storeName, setStoreName] = useState(fallbackStoreName);

  useEffect(() => {
    let active = true;
    storeInfoAPI.getPublic()
      .then(({ data }) => {
        if (active && data?.name?.trim()) setStoreName(data.name.trim());
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  return storeName;
}

export function ProductImage({ src, alt, watermark, imageSx, priority = false }: { src: string; alt: string; watermark: string; imageSx?: SxProps<Theme>; priority?: boolean }) {
  return <Box sx={{ position: "relative", overflow: "hidden", bgcolor: "#e9e5dc" }}>
    <Box component="img" loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" src={src} alt={alt} sx={{ display: "block", width: "100%", objectFit: "cover", transition: "transform .45s ease", ...imageSx }} />
    <Box aria-hidden sx={{ position: "absolute", right: 10, bottom: 10, px: 1, py: .45, borderRadius: .5, bgcolor: "rgba(20,20,20,.62)", color: "white", fontSize: ".62rem", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", pointerEvents: "none", userSelect: "none" }}>
      © {watermark}
    </Box>
  </Box>;
}
