"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { AuthProvider } from "@/context/auth";
import { ReactNode } from "react";

const theme = createTheme({
  palette: {
    primary: {
      main: "#F57C00",
    },
    secondary: {
      main: "#424242",
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
  },
});

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
