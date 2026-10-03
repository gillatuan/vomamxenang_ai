"use client";

import { useEffect, useState } from "react";
import { Box, type SxProps, type Theme } from "@mui/material";
import { storeInfoAPI } from "@/lib/api-client";

import { ContentImage } from "./ContentImage";

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

export function ProductImage({ src, alt, watermark, fallbackSrc, imageSx, priority = false }: { src?: string | null; alt: string; watermark: string; fallbackSrc?: string; imageSx?: SxProps<Theme>; priority?: boolean }) {
  return <Box sx={{ position: "relative", overflow: "hidden", bgcolor: "#e9e5dc" }}>
    <ContentImage src={src} alt={alt} fallbackSrc={fallbackSrc} priority={priority} sx={{ transition: "transform .45s ease", ...imageSx }} />
    <Box aria-hidden sx={{ position: "absolute", right: 10, bottom: 10, px: 1, py: .45, borderRadius: .5, bgcolor: "rgba(20,20,20,.62)", color: "white", fontSize: ".62rem", fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", pointerEvents: "none", userSelect: "none" }}>
      © {watermark}
    </Box>
  </Box>;
}
