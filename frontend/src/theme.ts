import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1A1A1A",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#B7793E",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F7F6F2",
      paper: "#ffffff",
    },
    text: { primary: "#1A1A1A", secondary: "#66645F" },
  },
  shape: {
    borderRadius: 0,
  },
  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",
    h1: { fontSize: "clamp(2.5rem, 5vw, 5.5rem)", fontWeight: 500, lineHeight: 1.03, letterSpacing: "-0.055em" },
    h2: { fontSize: "clamp(2rem, 3.5vw, 3.75rem)", fontWeight: 500, lineHeight: 1.08, letterSpacing: "-0.04em" },
    h3: { fontSize: "clamp(1.8rem, 3vw, 3rem)", fontWeight: 500, lineHeight: 1.12, letterSpacing: "-0.035em" },
    h4: { fontWeight: 500, letterSpacing: "-0.03em" },
    button: { fontWeight: 700, fontSize: "0.72rem", letterSpacing: "0.12em" },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        variant: "contained",
      },
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: "none",
          minHeight: 44,
          paddingLeft: "1.5rem",
          paddingRight: "1.5rem",
          transition: "background-color .2s ease, color .2s ease, border-color .2s ease",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: "none",
        },
      },
    },
    MuiAppBar: { styleOverrides: { root: { backgroundColor: "#fff", color: "#1a1a1a", boxShadow: "none", borderBottom: "1px solid #e6e3dd" } } },
    MuiCssBaseline: { styleOverrides: { body: { backgroundColor: "#F7F6F2" }, "*::selection": { background: "#1A1A1A", color: "#fff" } } },
  },
});

export default theme;
