import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0",
      contrastText: "#ffffff"
    },
    secondary: {
      main: "#dc004e",
      light: "#e33371",
      dark: "#9a0036",
      contrastText: "#ffffff"
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff"
    }
  },
  typography: {
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif"
    ].join(","),
    h1: {
      fontWeight: 600
    },
    h2: {
      fontWeight: 600
    },
    h3: {
      fontWeight: 600
    },
    h4: {
      fontWeight: 600
    },
    h5: {
      fontWeight: 600
    },
    h6: {
      fontWeight: 600
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500
        }
      }
    }
  }
});
