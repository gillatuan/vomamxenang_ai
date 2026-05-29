import { createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#F57C00",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#263238",
      contrastText: "#ffffff",
    },
    background: {
      default: "#F8F9FA",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 6,
  },
  typography: {
    fontFamily: "Inter, Roboto, sans-serif",
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
        variant: "contained",
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: "none",
          paddingLeft: "1.25rem",
          paddingRight: "1.25rem",
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
          borderRadius: 10,
        },
      },
    },
  },
});

export default theme;
