import { Paper, Typography } from "@mui/material";
import TimeChart from "@src/components/TimeChart";
import React from "react";
import useFormat from "@src/utils/useFormat";
import { HistoryStatistics } from "@assets-wallet/api/src/portfolio/types";
import { useTranslation } from "next-i18next";

const twrPeriodColumnMapper: Record<string, 5 | 6 | 7> = {
  "1M": 5,
  "1Y": 6,
  "3Y": 7,
};
export default function PerformanceChart(props: {
  assetsData?: HistoryStatistics["assets"];
  portfolioData?: HistoryStatistics["portfolio"];
  twrPeriod: keyof typeof twrPeriodColumnMapper;
  labels: string[];
  id?: string;
}) {
  const { percentFormat } = useFormat();
  const { t } = useTranslation();
  return (
    <Paper id={props.id} sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        {t("performanceChart.title", { period: props.twrPeriod })}
      </Typography>
      <TimeChart
        assetsData={props.assetsData}
        portfolioData={props.portfolioData}
        pickValue={(data) => data[twrPeriodColumnMapper[props.twrPeriod]]}
        formatValue={(value) => (value != null ? percentFormat(value, 1) : "")}
        labels={props.labels}
      />
    </Paper>
  );
}
