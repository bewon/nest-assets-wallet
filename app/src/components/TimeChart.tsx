import type {
  HistoryStatistics,
  TransformedHistoryStatistics,
} from "@assets-wallet/api/src/portfolio/types";
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
import {
  alpha,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
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
  Filler,
);

export default function TimeChart(props: {
  assetsData?: HistoryStatistics["assets"];
  portfolioData?: HistoryStatistics["portfolio"];
  stepped?: boolean;
  pickValue: (data: TransformedHistoryStatistics[0]) => number | null;
  formatValue: (value: number | null) => string;
  labels: string[];
}) {
  const chartDefaults = useChartDefaults();
  const theme = useTheme();
  const { t } = useTranslation();
  const isMdDown = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.down("md"),
  );

  const data = useMemo<ChartData<"line"> | undefined>(() => {
    const getValue = (data: TransformedHistoryStatistics, label: string) => {
      const value = data.find(([date]) => date === label);
      return value == null ? null : props.pickValue(value);
    };
    const { portfolioData } = props;
    if (portfolioData == null) {
      return undefined;
    }
    return {
      labels: props.labels,
      datasets: [
        {
          label: t("general.portfolio"),
          data: props.labels.map((label) => getValue(portfolioData, label)),
          borderColor: theme.palette.secondary.main,
          backgroundColor: alpha(theme.palette.secondary.main, 0.1),
          fill: true,
          stepped: props.stepped ?? false,
          pointRadius: 0,
          pointHitRadius: 10,
          borderWidth: 2,
        },
        ...(props.assetsData ?? []).map((asset, index) => ({
          label: asset.name,
          data: props.labels.map((label) => getValue(asset.values, label)),
          borderColor: assetsPalette[index],
          backgroundColor: alpha(assetsPalette[index], 0.1),
          fill: true,
          stepped: props.stepped ?? false,
          pointRadius: 0,
          pointHitRadius: 10,
          borderWidth: 2,
        })),
      ],
    };
  }, [props.portfolioData, props.assetsData, theme, t, props.labels]);

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
            label: (context) => {
              const value = context.parsed.y;
              return `${context.dataset.label}: ${props.formatValue(value)}`;
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
        y: {
          ticks: {
            callback: (value) =>
              typeof value === "string" ? value : props.formatValue(value),
          },
        },
      },
    }),
    [chartDefaults, isMdDown],
  );

  return (
    <Box sx={{ height: 450 }}>
      {data == null ? (
        <CircularProgress sx={{ margin: "auto", display: "block" }} />
      ) : (
        <Line data={data} options={options} />
      )}
    </Box>
  );
}
