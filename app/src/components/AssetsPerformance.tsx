import type {
  AssetSnapshot,
  PortfolioPerformanceStatistics,
  AnnualizedCalculation,
} from "@assets-wallet/api/src/portfolio/types";
import { useTranslation } from "next-i18next";
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Tooltip,
} from "@mui/material";
import PeriodSelector from "@src/components/PeriodSelector";
import { TbPigMoney, TbReportMoney } from "react-icons/tb";
import useFormat from "@src/utils/useFormat";
import { assetsPalette } from "@src/utils/theme";
import type { Theme } from "@mui/material/styles";

function findPerformance(
  performanceStatistics?: PortfolioPerformanceStatistics["assets"],
  assetId?: string,
  period?: string
): AnnualizedCalculation | undefined {
  if (performanceStatistics == null || assetId == null || period == null) {
    return undefined;
  }
  return performanceStatistics.find(
    (assetPerformance) => assetPerformance.id === assetId
  )?.performance?.[period];
}

export default function AssetsPerformance(props: {
  assets?: AssetSnapshot[];
  performanceStatistics?: PortfolioPerformanceStatistics["assets"];
}) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<string>();
  const periods = useMemo(
    () => Object.keys(props.performanceStatistics?.[0]?.performance ?? {}),
    [props.performanceStatistics]
  );

  const assetsData = useMemo(
    () =>
      props.assets?.map((asset) => ({
        ...asset,
        performance: findPerformance(
          props.performanceStatistics,
          asset.id,
          period
        ),
      })),
    [props.assets, props.performanceStatistics, period]
  );

  useEffect(() => {
    if (periods.length > 0) {
      setPeriod(periods[0]);
    }
  }, [periods]);

  return (
    <Paper>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography variant="h6" sx={{ mr: 1 }}>
          {t("assetsPerformance.title")}
        </Typography>
        <PeriodSelector
          period={period}
          onPeriodChange={setPeriod}
          allPeriods={periods}
        />
      </Box>
      {assetsData == null ? (
        <CircularProgress sx={{ mt: 3, mb: 1 }} />
      ) : (
        <List sx={{ pb: 2 }}>
          {assetsData.map((asset, index) => (
            <AssetItem
              key={asset.id}
              asset={asset}
              assetColor={assetsPalette[index % assetsPalette.length]}
            />
          ))}
        </List>
      )}
    </Paper>
  );
}

function AssetItem(props: {
  asset: AssetSnapshot & { performance?: AnnualizedCalculation };
  assetColor: string;
}) {
  const { t } = useTranslation();
  const { percentFormat } = useFormat();
  const annualizedTwr = props.asset.performance?.annualizedTwr;
  const getAnnualizedTwrColor = (theme: Theme) =>
    annualizedTwr == null || annualizedTwr === 0
      ? null
      : annualizedTwr > 0
      ? theme.palette.success.main
      : theme.palette.error.main;

  return (
    <ListItem
      sx={{
        display: "flex",
        justifyContent: "space-between",
        py: 1,
        "&:hover": {
          backgroundColor: (theme) => theme.palette.grey[500] + "15",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box
          sx={{
            width: 5,
            height: 45,
            borderRadius: 1,
            backgroundColor: props.assetColor,
            mr: 2,
          }}
        />
        <Box>
          <ListItemText primary={props.asset.name} />
          <Box>
            <PerformanceChip
              icon={<TbPigMoney />}
              value={props.asset.performance?.capitalChange}
              title={t("portfolioPerformance.capitalChange")}
            />
            <PerformanceChip
              icon={<TbReportMoney />}
              value={props.asset.performance?.valueChange}
              title={t("portfolioPerformance.valueChange")}
            />
          </Box>
        </Box>
      </Box>
      <Tooltip title={t("general.annuallyPhraseDescription")}>
        <Typography variant="h6" sx={{ color: getAnnualizedTwrColor }}>
          {percentFormat(annualizedTwr ?? 0, 1)}
        </Typography>
      </Tooltip>
    </ListItem>
  );
}

function PerformanceChip(props: {
  icon: React.ReactElement;
  title: string;
  value?: number;
}) {
  const { amountFormat } = useFormat();
  return (
    <Tooltip title={props.title} arrow>
      <Chip
        icon={props.icon}
        label={amountFormat(props.value, 0, true) ?? "-"}
        size={"small"}
        variant="outlined"
        sx={{ mr: 1 }}
      />
    </Tooltip>
  );
}
