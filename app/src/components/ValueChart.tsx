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
} from "chart.js";
import { Line } from "react-chartjs-2";
import useChartDefaults from "@src/utils/useChartDefaults";

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
  const chartDefaults = useChartDefaults();

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

  const options = useMemo<ChartOptions<"line">>(
    () => ({
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
    }),
    [chartDefaults]
  );

  return <Line data={data} options={options} />;
}
