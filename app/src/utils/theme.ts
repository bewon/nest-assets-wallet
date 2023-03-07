import { Roboto } from "@next/font/google";
import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";
import { enUS, plPL } from "@mui/material/locale";
import { enUS as enUSDataGrid, plPL as plPLDataGrid } from "@mui/x-data-grid";
import { UserSettings } from "@src/components/UserSettingsProvider";

export const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica", "Arial", "sans-serif"],
});

export const primaryColor = "#1976d2";
export const secondaryColor = "#f46a40";

export const prepareTheme = (
  language: string,
  themeMode: UserSettings["themeMode"]
) =>
  createTheme(
    {
      palette: {
        mode: themeMode,
        primary: { main: primaryColor },
        secondary: { main: secondaryColor, contrastText: "#fff" },
        error: {
          main: red.A400,
        },
        background: {
          default: themeMode === "dark" ? "#121212" : "#eee",
          paper: themeMode === "dark" ? "#1c1c1c" : "#fff",
        },
      },
      typography: {
        fontFamily: roboto.style.fontFamily,
      },
      components: {
        MuiTab: {
          styleOverrides: {
            root: {
              color: "rgba(255, 255, 255, 0.6)",
              "&.Mui-selected": {
                color: "#fff",
              },
            },
          },
        },
      },
    },
    language === "pl"
      ? { ...plPL, ...plPLDataGrid }
      : { ...enUS, ...enUSDataGrid }
  );

export const assetsPalette = [
  "#c149e9",
  "#e9c149",
  "#49e971",
  "#49e9e9",
  "#4971e9",
  "#9949e9",
  "#e949c1",
  "#e97149",
  "#e9e949",
  "#49e999",
  "#49c1e9",
  "#4949e9",
  "#e94949",
  "#49e949",
  "#e99949",
  "#c1e949",
  "#e94999",
  "#49e9c1",
  "#4999e9",
  "#7149e9",
  "#e949e9",
  "#71e949",
  "#e94971",
  "#99e949",
];

export const defaultChartFont = {
  family: roboto.style.fontFamily,
  size: 14,
};
