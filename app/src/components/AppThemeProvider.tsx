import CssBaseline from "@mui/material/CssBaseline";
import * as React from "react";
import { prepareTheme } from "@src/utils/theme";
import { ThemeProvider } from "@mui/material/styles";
import { useTranslation } from "next-i18next";
import { useContext } from "react";
import { UserSettingsContext } from "@src/pages/_app";

export default function AppThemeProvider(props: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const userSettings = useContext(UserSettingsContext);
  const theme = prepareTheme(i18n.language, userSettings.themeMode);
  return (
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      {props.children}
    </ThemeProvider>
  );
}
