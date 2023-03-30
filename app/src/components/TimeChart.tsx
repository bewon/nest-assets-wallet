import type { HistoryStatistics } from "@assets-wallet/api/src/portfolio/types";
import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm";
import { useMemo } from "react";
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
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import useChartDefaults from "@src/utils/useChartDefaults";
import { alpha, useMediaQuery, useTheme } from "@mui/material";
import { Theme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { useTranslation } from "next-i18next";
import { assetsPalette } from "@src/utils/theme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function TimeChart(props: {
  assetsData?: HistoryStatistics["assets"];
  portfolioData?: HistoryStatistics["portfolio"];
}) {
  const chartDefaults = useChartDefaults();
  const theme = useTheme();
  const { t } = useTranslation();
  const isMdDown = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.down("md")
  );

  const data = useMemo<ChartData<"line">>(() => {
    const labels = (props.portfolioData ?? []).map(([date]) => date);
    return {
      labels,
      datasets: [
        {
          label: t("general.portfolio"),
          data: (props.portfolioData ?? []).map(([, , value]) => value),
          borderColor: theme.palette.secondary.main,
          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
          fill: true,
          stepped: true,
          pointRadius: 0,
          pointHitRadius: 10,
          borderWidth: 2,
        },
        ...(props.assetsData ?? []).map((asset, index) => ({
          label: asset.name,
          data: asset.values.map(([, , value]) => value),
          borderColor: assetsPalette[index],
          backgroundColor: alpha(assetsPalette[index], 0.1),
          fill: true,
          stepped: true,
          pointRadius: 0,
          pointHitRadius: 10,
          borderWidth: 2,
        })),
      ],
    };
  }, [props.portfolioData, props.assetsData, theme, t]);

  const options = useMemo<ChartOptions<"line">>(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: isMdDown ? "bottom" : "right",
        },
        tooltip: {
          callbacks: {
            title: (tooltipItem) => {
              return tooltipItem[0].label.replace(/,\s*\d+:\d+:\d+\s*\w*/i, "");
            },
          },
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
    }),
    [chartDefaults, isMdDown]
  );

  return (
    <Box sx={{ height: 450 }}>
      <Line data={data} options={options} />
    </Box>
  );
}
