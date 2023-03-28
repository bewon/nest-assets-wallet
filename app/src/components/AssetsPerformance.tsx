import type {
  AssetSnapshotInterface,
  PortfolioPerformanceStatistics,
  AnnualizedCalculation,
} from "@assets-wallet/api/src/portfolio/types";
import { useTranslation } from "next-i18next";
import React, { useContext, useMemo } from "react";
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
import { UserSettingsContext } from "@src/components/UserSettingsProvider";
import AssetPoint from "@src/components/AssetPoint";

type AssetItemData = AssetSnapshotInterface & {
  performance?: AnnualizedCalculation;
  color: string;
};

function findPerformance(
  performanceStatistics: PortfolioPerformanceStatistics["assets"],
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
  assets?: AssetSnapshotInterface[];
  performanceStatistics?: PortfolioPerformanceStatistics["assets"];
  periods: string[];
  period?: string;
  onPeriodChange: (period: string) => void;
}) {
  const { t } = useTranslation();
  const userSettings = useContext(UserSettingsContext);

  const assetsData = useMemo(() => {
    if (props.assets == null || props.performanceStatistics == null)
      return null;
    const data: Array<AssetItemData> = [];
    props.assets?.forEach((asset, index) => {
      if (userSettings?.hideZeroAssets && (asset.value ?? 0) === 0) return;
      data.push({
        ...asset,
        performance: findPerformance(
          props.performanceStatistics,
          asset.id,
          props.period
        ),
        color: assetsPalette[index % assetsPalette.length],
      });
    });
    return data;
  }, [props.assets, props.performanceStatistics, props.period, userSettings]);

  return (
    <Paper>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 2 }}>
        <Typography variant="h6" sx={{ mr: 1 }}>
          {t("assetsPerformance.title")}
        </Typography>
        <PeriodSelector
          period={props.period}
          onPeriodChange={props.onPeriodChange}
          allPeriods={props.periods}
        />
      </Box>
      {assetsData == null ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List sx={{ pb: 2 }}>
          {assetsData.map((asset) => (
            <AssetItem key={asset.id} asset={asset} />
          ))}
        </List>
      )}
    </Paper>
  );
}

function AssetItem(props: { asset: AssetItemData }) {
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
        <AssetPoint color={props.asset.color} sx={{ mr: 2, height: 45 }} />
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
