"use client";

import { Inter } from "next/font/google";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";

const font = Inter({ subsets: ["latin"] });

const theme = createTheme({
  typography: {
    fontFamily: font.style.fontFamily,
  },
  components: {
    MuiCardHeader: {
      defaultProps: {
        titleTypographyProps: {
          variant: "h5",
        },
      },
      styleOverrides: {
        root: {
          paddingBottom: 0,
        },
      },
    }
  },
  palette: {
    mode: "dark",
  },
});

export default function ThemeManager({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider
      theme={theme}
    >
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
