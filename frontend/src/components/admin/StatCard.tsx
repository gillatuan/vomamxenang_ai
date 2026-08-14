import { Card, CardActionArea, CardContent, Typography } from "@mui/material";
import { ReactNode } from "react";
import NextLink from "next/link";

export function StatCard({ label, value, icon, href }: { label: string; value: string | number; icon: ReactNode; href?: string }) {
  const content = <CardContent sx={{ minWidth: 0 }}><Typography color="text.secondary" variant="body2">{label}</Typography><Typography variant="h4" fontWeight={800} sx={{ my: .5 }}>{value}</Typography><Typography component="span" color="primary.main">{icon}</Typography></CardContent>;
  return <Card sx={{ height: "100%" }}>{href ? <CardActionArea component={NextLink} href={href} sx={{ height: "100%" }}>{content}</CardActionArea> : content}</Card>;
}
