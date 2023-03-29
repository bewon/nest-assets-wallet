import type { HistoryStatistics } from "@assets-wallet/api/src/portfolio/types";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  defaults,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { setChartDefaults } from "@src/utils/theme";
import { useTheme } from "@mui/material";
import setDayjsLocale from "@src/utils/setDayjsLocale";
import { useTranslation } from "next-i18next";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ValueChart(props: {
  assetsData?: HistoryStatistics["assets"];
  portfolioData?: HistoryStatistics["portfolio"];
}) {
  const theme = useTheme();
  const { i18n } = useTranslation();
  const [chartLocale, setChartLocale] = useState<string>();
  useEffect(() => {
    setDayjsLocale(i18n.language).then(() => setChartLocale(i18n.language));
  }, [i18n.language]);

  const data = useMemo<ChartData<"line">>(() => {
    const labels = (props.portfolioData ?? []).map(([date]) => date);
    return {
      labels,
      datasets: [
        {
          label: "Portfolio",
          data: (props.portfolioData ?? []).map(([, , value]) => value),
          borderColor: "#000000",
          backgroundColor: "#000000",
          fill: true,
        },
      ],
    };
  }, [props.portfolioData]);

  const options = useMemo<ChartOptions<"line">>(() => {
    setChartDefaults(defaults, theme);
    return {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
        title: {
          display: true,
          text: "Portfolio value",
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            unit: "month",
          },
        },
      },
    };
  }, [theme]);

  if (chartLocale !== i18n.language) {
    return null;
  }
  return <Line data={data} options={options} />;
}
