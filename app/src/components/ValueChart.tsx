import { Paper, Typography } from "@mui/material";
import TimeChart from "@src/components/TimeChart";
import React from "react";
import useFormat from "@src/utils/useFormat";
import { HistoryStatistics } from "@assets-wallet/api/src/portfolio/types";
import { useTranslation } from "next-i18next";

export default function ValueChart(props: {
  assetsData?: HistoryStatistics["assets"];
  portfolioData?: HistoryStatistics["portfolio"];
}) {
  const { amountFormat } = useFormat();
  const { t } = useTranslation();
  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t("valueChart.title")}
      </Typography>
      <TimeChart
        stepped
        assetsData={props.assetsData}
        portfolioData={props.portfolioData}
        pickValue={(data) => data[2]}
        formatValue={(value) => amountFormat(value ?? undefined) ?? ""}
      />
    </Paper>
  );
}
