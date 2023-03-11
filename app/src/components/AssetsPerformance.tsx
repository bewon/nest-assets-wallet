import type {
  AssetSnapshot,
  PortfolioPerformanceStatistics,
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

export default function AssetsPerformance(props: {
  assets?: AssetSnapshot[];
  performanceStatistics?: PortfolioPerformanceStatistics["assets"];
}) {
  const { t } = useTranslation();
  const { amountFormat, percentFormat } = useFormat();
  const [period, setPeriod] = useState<string>();
  const periods = useMemo(
    () => Object.keys(props.performanceStatistics?.[0]?.annualizedTwr ?? {}),
    [props.performanceStatistics]
  );
  useEffect(() => {
    if (periods.length > 0) {
      setPeriod(periods[0]);
    }
  }, [periods]);
  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">{t("assetsPerformance.title")}</Typography>
        <PeriodSelector
          period={period}
          onPeriodChange={setPeriod}
          allPeriods={periods}
        />
      </Box>
      {props.assets == null ? (
        <CircularProgress sx={{ mt: 3, mb: 1 }} />
      ) : (
        <List>
          {props.assets.map((asset, index) => (
            <ListItem
              key={asset.id}
              disablePadding
              sx={{
                display: "flex",
                justifyContent: "space-between",
                py: 1,
                "&:hover": {
                  // add alpha 0.2 to background paper color
                  backgroundColor: (theme) =>
                    theme.palette.mode === "light"
                      ? theme.palette.grey[100]
                      : theme.palette.grey[900],
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 5,
                    height: 45,
                    borderRadius: 1,
                    backgroundColor:
                      assetsPalette[index % assetsPalette.length],
                    mr: 2,
                  }}
                />
                <Box>
                  <ListItemText primary={asset.name} />
                  <Box>
                    <Tooltip
                      title={t("portfolioPerformance.capitalChange")}
                      arrow
                    >
                      <Chip
                        icon={<TbPigMoney />}
                        label={amountFormat(200)}
                        size={"small"}
                        sx={{ mr: 1 }}
                      />
                    </Tooltip>
                    <Tooltip
                      title={t("portfolioPerformance.valueChange")}
                      arrow
                    >
                      <Chip
                        icon={<TbReportMoney />}
                        label={amountFormat(100)}
                        size={"small"}
                      />
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
              <Typography variant="h6">{percentFormat(0.1357, 1)}</Typography>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
