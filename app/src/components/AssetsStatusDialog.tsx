import type { AssetSnapshot } from "@assets-wallet/api/src/portfolio/types";
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
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { useTranslation } from "next-i18next";
import useFormat from "@src/utils/useFormat";
import { assetsPalette, roboto } from "@src/config/theme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function AssetsStatusDialog(props: {
  open: boolean;
  onClose: () => void;
  assets?: AssetSnapshot[];
}) {
  const { t } = useTranslation();
  const { amountFormat } = useFormat();
  const otherGroupLabel = t("portfolioStatus.otherGroup");

  const groupsData = useMemo(() => {
    const data: Record<string, AssetSnapshot[]> = {};
    props.assets?.forEach((asset) => {
      const group = asset.group ?? otherGroupLabel;
      if (!data[group]) {
        data[group] = [];
      }
      data[group].push(asset);
    });
    return data;
  }, [props.assets, t]);

  const data: ChartData<"bar"> = useMemo(() => {
    const labels = Object.keys(groupsData);
    return {
      labels,
      datasets:
        props.assets?.map(({ group, value, name }, index) => ({
          label: name,
          data: labels.map((label) =>
            label === (group ?? otherGroupLabel) ? value ?? null : null
          ),
          backgroundColor: assetsPalette[index],
        })) ?? [],
    };
  }, [props.assets, groupsData]);

  const options = useMemo(() => {
    return {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: {
              family: roboto.style.fontFamily,
              size: 14,
            },
          },
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
                0
              );
              return `${group}: ${amountFormat(sum)}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            font: {
              family: roboto.style.fontFamily,
              size: 14,
            },
          },
        },
        y: {
          stacked: true,
          ticks: {
            font: {
              family: roboto.style.fontFamily,
              size: 14,
            },
          },
        },
      },
    } as ChartOptions<"bar">;
  }, [amountFormat, groupsData]);

  const handleClose = props.onClose;
  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Assets Status</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Bar
            data={data}
            options={options}
            height={(Object.keys(groupsData).length + 1) * 60}
          />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
