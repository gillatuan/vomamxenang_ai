"use client";

import { useState } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';

const examples = {
  product: '/images/products/solid-warehouse.png',
  post: '/images/products/tire-rim-service.png',
};

export function ContentImage({ src, alt, kind = 'product', priority = false, sx }: {
  src?: string | null;
  alt: string;
  kind?: keyof typeof examples;
  priority?: boolean;
  sx?: SxProps<Theme>;
}) {
  const source = src?.trim() || '';
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const fallback = !source || failedSource === source;
  return <Box component="img"
    src={fallback ? examples[kind] : source}
    alt={fallback ? 'Ảnh minh họa vỏ và mâm xe nâng' : alt}
    loading={priority ? 'eager' : 'lazy'}
    {...{ fetchpriority: priority ? 'high' : 'auto' }}
    decoding="async"
    onError={() => { if (!fallback) setFailedSource(source); }}
    sx={{ display: 'block', width: '100%', objectFit: 'cover', bgcolor: '#e9e5dc', ...sx }}
  />;
}
