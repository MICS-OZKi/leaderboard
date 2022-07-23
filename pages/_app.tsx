import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Box, createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import Footer from "components/footer";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    text: {
      primary: "#FFFFFF",
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Component {...pageProps} />
        <Footer />
      </ThemeProvider>
    </Box>
  );
}

export default MyApp;
