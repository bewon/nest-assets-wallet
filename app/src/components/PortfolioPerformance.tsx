import type {
  AssetSnapshot,
  PortfolioPerformanceStatistics,
} from "@assets-wallet/api/src/portfolio/types";
import {
  Box,
  Chip,
  CircularProgress,
  List,
  ListItem,
  Paper,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import Typography from "@mui/material/Typography";
import { useTranslation } from "next-i18next";
import { groupAssets } from "@src/components/PortfolioStatusDialog";
import { TbPigMoney, TbReportMoney, TbTrendingUp } from "react-icons/tb";
import useFormat from "@src/utils/useFormat";

export default function PortfolioPerformance(props: {
  assets?: AssetSnapshot[];
  performanceStatistics?: PortfolioPerformanceStatistics["portfolio"];
}) {
  const { t } = useTranslation();
  const { amountFormat, percentFormat } = useFormat();
  const [period, setPeriod] = useState<string>();
  useEffect(() => {
    if (props.performanceStatistics) {
      setPeriod(Object.keys(props.performanceStatistics)[0]);
    }
  }, [props.performanceStatistics]);

  const groupsData: Record<string, object> = useMemo(() => {
    const groupedAssets = groupAssets(props.assets ?? []);
    return Object.fromEntries(
      Object.entries(groupedAssets).map(([group, assets]) => [
        group,
        {
          assetsList: assets.map((asset) => asset.name).join(", "),
          capitalChange:
            period && props.performanceStatistics != null
              ? props.performanceStatistics[period]?.capitalChange
              : 0,
          valueChange: 100,
          annualizedTwr:
            period && props.performanceStatistics != null
              ? props.performanceStatistics[period]?.annualizedTwr
              : 0,
        },
      ])
    );
  }, [props.assets, props.performanceStatistics, period]);

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">{t("portfolioPerformance.title")}</Typography>
        <FormControl sx={{ width: 120 }} variant="standard">
          <InputLabel id="demo-simple-select-label">
            {t("portfolioPerformance.period")}
          </InputLabel>
          <Select
            value={period ?? ""}
            label={t("portfolioPerformance.period")}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {Object.keys(props.performanceStatistics ?? {}).map((period) => (
              <MenuItem key={period} value={period}>
                {period}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      {props.assets == null ? (
        <CircularProgress sx={{ mt: 3, mb: 1 }} />
      ) : (
        <List sx={{ pb: 0 }}>
          {Object.keys(groupsData).map((group) => (
            <ListItem
              key={group}
              disablePadding
              sx={{
                display: "flex",
                pt: 1,
              }}
            >
              <Tooltip title={groupsData[group]?.assetsList}>
                <Typography
                  variant="subtitle2"
                  sx={{ py: 1, width: "25%", minWidth: 120 }}
                >
                  {group}
                </Typography>
              </Tooltip>
              <Box sx={{ flexGrow: 1, display: ["block", "flex"], pt: 1 }}>
                <Box sx={{ minWidth: [0, 150], mb: 1 }}>
                  <Chip
                    icon={<TbPigMoney />}
                    label={amountFormat(groupsData[group]?.capitalChange)}
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ minWidth: [0, 150], mb: 1 }}>
                  <Chip
                    icon={<TbReportMoney />}
                    label={amountFormat(groupsData[group]?.valueChange)}
                    variant="outlined"
                    color="primary"
                  />
                </Box>
                <Chip
                  icon={<TbTrendingUp />}
                  label={percentFormat(groupsData[group]?.annualizedTwr, 2)}
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
