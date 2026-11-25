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

export function ProductImage({ src, alt, watermark, imageSx, priority = false }: {
  src?: string | null;
  alt: string;
  watermark: string;
  // Kept for existing call sites; placeholders are never treated as product images.
  fallbackSrc?: string;
  imageSx?: SxProps<Theme>;
  priority?: boolean;
}) {
  const url = src?.trim() || "";
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const hasRealImage = !!url && failedSource !== url;

  if (!hasRealImage) {
    return <Box role="img" aria-label={`Chưa có ảnh sản phẩm thực tế: ${alt}`}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 180,
        px: 3, textAlign: "center", bgcolor: "#f4f1eb", color: "#59544b", ...imageSx }}>
      Chưa có ảnh sản phẩm thực tế
    </Box>;
  }

  return <Box sx={{ position: "relative", overflow: "hidden", bgcolor: "#e9e5dc" }}>
    <Box component="img" src={url} alt={alt}
      loading={priority ? "eager" : "lazy"} {...{ fetchPriority: priority ? "high" : "auto" }}
      decoding="async" onError={() => setFailedSource(url)}
      sx={{ display: "block", width: "100%", objectFit: "contain", ...imageSx }} />
    <Box aria-hidden sx={{ position: "absolute", right: 10, bottom: 10, px: 1, py: .45,
      borderRadius: .5, bgcolor: "rgba(20,20,20,.62)", color: "white", fontSize: ".62rem",
      fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", pointerEvents: "none",
      userSelect: "none" }}>© {watermark}</Box>
  </Box>;
}
