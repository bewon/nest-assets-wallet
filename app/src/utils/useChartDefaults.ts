import { useTheme } from "@mui/material";
import { useTranslation } from "next-i18next";
import { defaults } from "chart.js";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import type { Typography } from "@mui/material/styles/createTypography";

type ChartDefaults = {
  color: string;
  fontFamily: Typography["fontFamily"];
  fontSize: Typography["fontSize"];
};
const setDayjsLocale = async (localeCode: string) => {
  try {
    if (localeCode !== "en") {
      await import(`dayjs/locale/${localeCode}.js`);
    }
    dayjs.locale(localeCode);
  } catch (error) {
    console.error(`Failed to load Day.js locale '${localeCode}':`, error);
  }
};

const updateDefaults = (chartDefaults: ChartDefaults) => {
  defaults.font.family = chartDefaults.fontFamily;
  defaults.font.size = chartDefaults.fontSize;
  defaults.color = chartDefaults.color;
};

export default function useChartDefaults() {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const [chartLocale, setChartLocale] = useState<string>();
  const [chartDefaults, setChartDefaults] = useState<ChartDefaults>();

  useEffect(() => {
    setDayjsLocale(i18n.language).then(() => setChartLocale(i18n.language));
  }, [i18n.language]);

  useEffect(() => {
    const _chartDefaults: ChartDefaults = {
      color: theme.palette.text.primary,
      fontFamily: theme.typography.fontFamily,
      fontSize: theme.typography.fontSize,
    };
    updateDefaults(_chartDefaults);
    setChartDefaults(_chartDefaults);
  }, [theme]);

  return useMemo(
    () => ({ chartsLocale: chartLocale, chartDefaults: chartDefaults }),
    [chartLocale, chartDefaults],
  );
}
