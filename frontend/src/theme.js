import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f172a", // deep slate-900
      light: "#1e293b",
      dark: "#020617",
    },
    secondary: {
      main: "#ea580c", // orange-600 (highlight)
      light: "#f97316",
      dark: "#c2410c",
    },
    success: {
      main: "#10b981", // emerald-500
      light: "#34d399",
      dark: "#047857",
    },
    warning: {
      main: "#f59e0b", // amber-500
      light: "#fbbf24",
      dark: "#b45309",
    },
    error: {
      main: "#ef4444", // red-500
      light: "#f87171",
      dark: "#b91c1c",
    },
    info: {
      main: "#06b6d4", // cyan-500
      light: "#22d3ee",
      dark: "#0891b2",
    },
    background: {
      default: "#f8fafc", // slate-50
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a", // slate-900
      secondary: "#475569", // slate-600
    },
  },
  typography: {
    fontFamily: "'Outfit', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    h1: { fontWeight: 800, fontFamily: "'Outfit', sans-serif" },
    h2: { fontWeight: 800, fontFamily: "'Outfit', sans-serif" },
    h3: { fontWeight: 700, fontFamily: "'Outfit', sans-serif" },
    h4: { fontWeight: 700, fontFamily: "'Outfit', sans-serif" },
    h5: { fontWeight: 700, fontFamily: "'Outfit', sans-serif" },
    h6: { fontWeight: 600, fontFamily: "'Outfit', sans-serif" },
    subtitle1: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 },
    subtitle2: { fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 },
    body1: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
    body2: { fontFamily: "'Plus Jakarta Sans', sans-serif" },
    button: { fontFamily: "'Outfit', sans-serif", fontWeight: 600 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0 4px 20px -2px rgba(15, 23, 42, 0.05)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
          "&:hover": {
            boxShadow: "0 12px 30px -4px rgba(15, 23, 42, 0.08)",
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "10px",
          textTransform: "none",
          fontWeight: 600,
          padding: "8px 18px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(234, 88, 12, 0.15)",
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          border: "1px solid #f1f5f9",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#f8fafc",
          "& .MuiTableCell-root": {
            color: "#64748b",
            fontWeight: 700,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "16px 20px",
          borderColor: "#f1f5f9",
          fontSize: "0.875rem",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 0.2s ease",
          "&:hover": {
            backgroundColor: "#f8fafc",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontWeight: 600,
          fontSize: "0.75rem",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "20px",
          padding: "12px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: "#ffffff",
            transition: "all 0.2s",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#cbd5e1",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderWidth: "2px",
            },
          },
        },
      },
    },
    MuiSelect: {
      defaultProps: {
        size: "small",
      },
      styleOverrides: {
        root: {
          borderRadius: "10px",
          backgroundColor: "#ffffff",
        },
      },
    },
  },
});

export default theme;
