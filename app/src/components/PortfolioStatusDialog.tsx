import type { AssetSnapshotInterface } from "@assets-wallet/api/src/portfolio/types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import React, { useMemo } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  ChartOptions,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import useFormat from "@src/utils/useFormat";
import { assetsPalette } from "@src/utils/theme";
import { useTranslation } from "next-i18next";
import useChartDefaults from "@src/utils/useChartDefaults";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export const groupAssets = (assets: AssetSnapshotInterface[]) => {
  const data: Record<string, AssetSnapshotInterface[]> = {};
  assets.forEach((asset) => {
    if (asset.group == null) {
      return;
    }
    if (!data[asset.group]) {
      data[asset.group] = [];
    }
    data[asset.group].push(asset);
  });
  return data;
};

export default function PortfolioStatusDialog(props: {
  open: boolean;
  onClose: () => void;
  assets: AssetSnapshotInterface[];
}) {
  const { amountFormat } = useFormat();
  const { t } = useTranslation();
  const chartDefaults = useChartDefaults();

  const groupsData = useMemo(() => groupAssets(props.assets), [props.assets]);

  const data = useMemo<ChartData<"bar">>(() => {
    const labels = Object.keys(groupsData);
    return {
      labels,
      datasets:
        props.assets.map(({ group, value, name }, index) => ({
          label: name,
          data: labels.map((label) =>
            label === group ? (value ?? null) : null,
          ),
          backgroundColor: assetsPalette[index],
        })) ?? [],
    };
  }, [props.assets, groupsData]);

  const options = useMemo<ChartOptions<"bar">>(() => {
    return {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const value = amountFormat(context.raw as number);
              return `${context.dataset?.label}: ${value}`;
            },
            title: function (context) {
              const group = context[0].label;
              const sum = groupsData[group].reduce(
                (sum, asset) => sum + (asset.value ?? 0),
                0,
              );
              return `${group}: ${amountFormat(sum)}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          title: {
            display: true,
            text: t("portfolioStatus.valueLabel"),
          },
        },
        y: {
          stacked: true,
          title: {
            display: true,
            text: t("portfolioStatus.groupLabel"),
          },
        },
      },
    };
  }, [amountFormat, groupsData, t, chartDefaults]);

  const chartHeight =
    (Object.keys(groupsData).length + 1) * 50 + (props.assets.length + 1) * 20;

  const handleClose = props.onClose;
  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{t("portfolioStatus.dialogTitle")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {Object.keys(groupsData).length === 0 ? (
            <p>{t("general.messages.noData")}</p>
          ) : (
            <Bar data={data} options={options} height={chartHeight} />
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("general.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}
