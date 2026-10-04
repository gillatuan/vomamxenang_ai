import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#ED6C02",
      dark: "#D86100",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ED6C02",
      dark: "#D86100",
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
    h1: { fontSize: "clamp(2.75rem, 6.2vw, 6.4rem)", fontWeight: 600, lineHeight: 0.98, letterSpacing: "-0.055em" },
    h2: { fontSize: "clamp(2.15rem, 4.2vw, 4.4rem)", fontWeight: 600, lineHeight: 1.03, letterSpacing: "-0.045em" },
    h3: { fontSize: "clamp(1.65rem, 3vw, 3.15rem)", fontWeight: 600, lineHeight: 1.08, letterSpacing: "-0.035em" },
    h4: { fontSize: "clamp(1.4rem, 2.3vw, 2.2rem)", fontWeight: 600, lineHeight: 1.12, letterSpacing: "-0.03em" },
    h5: { fontSize: "clamp(1.2rem, 1.8vw, 1.65rem)", fontWeight: 650, lineHeight: 1.2 },
    h6: { fontSize: "clamp(1.05rem, 1.35vw, 1.3rem)", fontWeight: 700, lineHeight: 1.25 },
    button: { fontWeight: 800, fontSize: "0.78rem", letterSpacing: "0.1em" },
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
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiOutlinedInput-root": {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.primary.main,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.primary.main,
              opacity: 0.8,
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: theme.palette.primary.main,
              opacity: 1,
            },
          },
          "& .MuiInputLabel-root.Mui-focused": { color: theme.palette.primary.main },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            opacity: 0.8,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            opacity: 1,
          },
        }),
      },
    },
    MuiSlider: { defaultProps: { color: "primary" } },
    MuiRadio: { defaultProps: { color: "primary" } },
    MuiTabs: { defaultProps: { textColor: "primary", indicatorColor: "primary" } },
    MuiPagination: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiPaginationItem-root": { color: theme.palette.primary.main },
          "& .Mui-selected": {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            "&:hover": { backgroundColor: theme.palette.primary.dark },
          },
        }),
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
