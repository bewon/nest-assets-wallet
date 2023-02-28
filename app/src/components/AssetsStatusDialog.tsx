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
import { assetsPalette } from "@src/config/theme";

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

  const options: ChartOptions<"bar"> = useMemo(() => {
    return {
      indexAxis: "y",
      responsive: true,
      plugins: {
        legend: { position: "bottom" },
      },
      scales: {
        x: { stacked: true },
        y: { stacked: true },
      },
    };
  }, []);

  const handleClose = props.onClose;
  return (
    <Dialog open={props.open} onClose={handleClose}>
      <DialogTitle>Assets Status</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Bar data={data} options={options} />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
