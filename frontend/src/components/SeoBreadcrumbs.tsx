import { homeDesign } from "@/app/home-design";
import Link from "next/link";
import { Breadcrumbs, Link as MuiLink, Typography } from "@mui/material";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import type { Crumb } from "@/lib/seo/structured-data";

export function SeoBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <Breadcrumbs
      component="nav"
      aria-label="Đường dẫn"
      separator={<NavigateNextRoundedIcon sx={{ fontSize: 18, color: homeDesign.colors.muted, opacity: .65 }} />}
      sx={{ mb: 3, fontSize: ".875rem", "& .MuiBreadcrumbs-ol": { alignItems: "center" } }}
    >
      {items.map((item, index) =>
        index === items.length - 1 ? (
          <Typography key={item.path} aria-current="page" variant="body2" color="text.secondary" fontWeight={600}>
            {item.name}
          </Typography>
        ) : (
          <MuiLink key={item.path} component={Link} href={item.path} underline="none" variant="body2" sx={{ color: "primary.main", fontWeight: 700, "&:hover": { color: homeDesign.colors.ink, opacity: .8 } }}>
            {item.name}
          </MuiLink>
        )
      )}
    </Breadcrumbs>
  );
}
