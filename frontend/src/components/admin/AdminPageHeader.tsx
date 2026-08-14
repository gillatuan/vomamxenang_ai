import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, alignItems: "flex-start", flexWrap: "wrap", mb: 3 }}><Box><Typography variant="h4" fontWeight={800}>{title}</Typography>{description && <Typography color="text.secondary" sx={{ mt: .5 }}>{description}</Typography>}</Box>{actions}</Box>;
}
