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
import useApi from "@src/utils/useApi";

type GroupData = {
  assetsList: string;
  capitalChange?: number;
  valueChange?: number;
  annualizedTwr?: number;
};

export default function PortfolioPerformance(props: {
  assets?: AssetSnapshot[];
  performanceStatistics?: PortfolioPerformanceStatistics["portfolio"];
}) {
  const { t } = useTranslation();
  const { amountFormat, percentFormat } = useFormat();
  const [period, setPeriod] = useState<string>();
  const [groupsPerformanceStatistics, setGroupsPerformanceStatistics] =
    useState<Record<string, PortfolioPerformanceStatistics>>({});
  const api = useApi();

  useEffect(() => {
    if (props.performanceStatistics != null) {
      setPeriod(Object.keys(props.performanceStatistics)[0]);
    }
  }, [props.performanceStatistics]);

  const groupedAssets = useMemo(() => {
    if (props.assets == null) return [];
    return groupAssets(props.assets ?? []);
  }, [props.assets]);

  const groupsData: Record<string, GroupData> = useMemo(() => {
    if (period == null) return {};
    return Object.fromEntries(
      Object.entries(groupedAssets).map(([group, assets]) => [
        group,
        {
          assetsList: assets.map((asset) => asset.name).join(", "),
          capitalChange:
            groupsPerformanceStatistics[group]?.portfolio[period]
              ?.capitalChange,
          annualizedTwr:
            groupsPerformanceStatistics[group]?.portfolio[period]
              ?.annualizedTwr,
          valueChange: 0,
        },
      ])
    );
  }, [groupedAssets, groupsPerformanceStatistics, period]);

  useEffect(() => {
    const abortRequests: (() => void)[] = [];
    for (const group of Object.keys(groupedAssets)) {
      const { makeRequest, abortRequest } = api.getGroupPerformanceStatistics({
        params: { group },
      });
      abortRequests.push(abortRequest);
      (async () => {
        try {
          const response = await makeRequest();
          if (response?.data) {
            setGroupsPerformanceStatistics((prev) => ({
              ...prev,
              [group]: response.data,
            }));
          }
        } catch (error: any) {
          console.error(error);
        }
      })();
    }
    return () => abortRequests.forEach((abortRequest) => abortRequest());
  }, [api, groupedAssets]);

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
                  label={percentFormat(
                    groupsData[group]?.annualizedTwr ?? 0,
                    2
                  )}
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
