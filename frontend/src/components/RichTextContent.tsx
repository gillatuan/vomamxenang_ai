"use client";

import { Box } from "@mui/material";
import { richTextHtml, richTextStyles } from "@/lib/rich-text";

export default function RichTextContent({ value }: { value?: string | null }) {
  return <Box sx={richTextStyles} dangerouslySetInnerHTML={{ __html: richTextHtml(value || "") }} />;
}
