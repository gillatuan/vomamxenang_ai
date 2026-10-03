"use client";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { AuthProvider } from "@/context/auth";
import theme from "@/theme";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  );
}
