import type {
  AssetSnapshot,
  PortfolioPerformanceStatistics,
} from "@assets-wallet/api/src/portfolio/types";
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  Paper,
  Tooltip,
} from "@mui/material";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import Typography from "@mui/material/Typography";
import { useTranslation } from "next-i18next";
import { groupAssets } from "@src/components/PortfolioStatusDialog";
import {
  TbPigMoney,
  TbReportMoney,
  TbTrendingDown,
  TbTrendingUp,
} from "react-icons/tb";
import useFormat from "@src/utils/useFormat";
import useApi from "@src/utils/useApi";
import { AxiosResponse } from "axios";
import PeriodSelector from "@src/components/PeriodSelector";

type PerformanceData = {
  assetsList: string;
  capitalChange?: number;
  valueChange?: number;
  profitChange?: number;
  annualizedTwr?: number;
};

const preparePerformanceValues = (
  assets: AssetSnapshot[],
  period: string,
  statistics?: PortfolioPerformanceStatistics["portfolio"]
): PerformanceData => {
  return {
    assetsList: assets.map((asset) => asset.name).join(", "),
    capitalChange: statistics?.[period]?.capitalChange,
    valueChange: statistics?.[period]?.valueChange,
    profitChange: statistics?.[period]?.profitChange,
    annualizedTwr: statistics?.[period]?.annualizedTwr,
  };
};

async function callApiForGroup<T>(
  makeRequest: () => Promise<AxiosResponse<T> | null>,
  group: string,
  setData: Dispatch<SetStateAction<Record<string, T>>>
) {
  try {
    const response = await makeRequest();
    if (response?.data) {
      setData((prev) => ({
        ...prev,
        [group]: response.data,
      }));
    }
  } catch (error: any) {
    console.error(error);
  }
}

export default function PortfolioPerformance(props: {
  assets?: AssetSnapshot[];
  performanceStatistics?: PortfolioPerformanceStatistics["portfolio"];
  periods: string[];
}) {
  const { t } = useTranslation();
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

  const groupsData = useMemo<Record<string, PerformanceData>>(() => {
    if (period == null) return {};
    return Object.fromEntries(
      Object.entries(groupedAssets).map(([group, assets]) => {
        const statistics = groupsPerformanceStatistics[group]?.portfolio;
        return [group, preparePerformanceValues(assets, period, statistics)];
      })
    );
  }, [groupedAssets, groupsPerformanceStatistics, period]);

  const portfolioData = useMemo<PerformanceData | undefined>(() => {
    if (period == null || props.performanceStatistics == null) return;
    return preparePerformanceValues([], period, props.performanceStatistics);
  }, [props.performanceStatistics, period]);

  useEffect(() => {
    const abortRequests: (() => void)[] = [];
    for (const group of Object.keys(groupedAssets)) {
      const { makeRequest, abortRequest } = api.getGroupPerformanceStatistics({
        params: { group },
      });
      abortRequests.push(abortRequest);
      callApiForGroup(makeRequest, group, setGroupsPerformanceStatistics);
    }
    return () => abortRequests.forEach((abortRequest) => abortRequest());
  }, [api, groupedAssets]);

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h6">{t("portfolioPerformance.title")}</Typography>
        <PeriodSelector
          period={period}
          onPeriodChange={setPeriod}
          allPeriods={props.periods}
        />
      </Box>
      {props.assets == null ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List sx={{ pb: 0 }}>
          {Object.keys(groupsData).map((group) => (
            <ListItem
              key={group}
              disablePadding
              sx={{ display: "flex", pt: 1 }}
            >
              <Tooltip title={groupsData[group]?.assetsList}>
                <Typography
                  variant="subtitle2"
                  sx={{ py: 1, width: "25%", minWidth: 120 }}
                >
                  {group}
                </Typography>
              </Tooltip>
              <PerformanceValues performanceData={groupsData[group]} />
            </ListItem>
          ))}
          <Divider sx={{ my: 1 }} />
          <ListItem disablePadding sx={{ display: "flex" }}>
            <Box sx={{ py: 1, width: "25%", minWidth: 120 }} />
            <PerformanceValues summary performanceData={portfolioData} />
          </ListItem>
        </List>
      )}
    </Paper>
  );
}

const PerformanceValues = (props: {
  performanceData?: PerformanceData;
  summary?: boolean;
}) => {
  const { amountFormat, percentFormat } = useFormat();
  const variant = props.summary ? "filled" : "outlined";
  const annualizedTwr = props.performanceData?.annualizedTwr;
  const { t } = useTranslation();

  const profitTooltip = (
    <>
      {t("general.annuallyPhraseDescription")}
      <Box component="span" sx={{ display: { xs: "inline", lg: "none" } }}>
        {", " + t("portfolioPerformance.profitChange") + ": "}
        {amountFormat(props.performanceData?.profitChange, 0, true)}
      </Box>
      <Box component="span" sx={{ display: { xs: "none", lg: "inline" } }}>
        {" / " + t("portfolioPerformance.profitChange")}
      </Box>
    </>
  );

  const profitLabel = (
    <>
      {percentFormat(annualizedTwr ?? 0, 1, true)}
      <Box component="span" sx={{ display: { xs: "none", lg: "inline" } }}>
        {" / " + amountFormat(props.performanceData?.profitChange, 0, true)}
      </Box>
    </>
  );

  return (
    <Box sx={{ flexGrow: 1, display: "flex", pt: 1, flexWrap: "wrap" }}>
      <Box sx={{ minWidth: [0, 130], mb: 1, mr: 1 }}>
        <Tooltip title={t("portfolioPerformance.capitalChange")} arrow>
          <Chip
            icon={<TbPigMoney />}
            label={amountFormat(props.performanceData?.capitalChange, 0, true)}
            variant={variant}
          />
        </Tooltip>
      </Box>
      <Box sx={{ minWidth: [0, 130], mb: 1, mr: 1 }}>
        <Tooltip title={t("portfolioPerformance.valueChange")} arrow>
          <Chip
            icon={<TbReportMoney />}
            label={amountFormat(props.performanceData?.valueChange, 0, true)}
            variant={variant}
            color="primary"
          />
        </Tooltip>
      </Box>
      <Tooltip title={profitTooltip} arrow>
        <Chip
          icon={
            (annualizedTwr ?? 0) < 0 ? <TbTrendingDown /> : <TbTrendingUp />
          }
          label={profitLabel}
          variant={variant}
          color={
            annualizedTwr == null || annualizedTwr === 0
              ? "default"
              : annualizedTwr > 0
              ? "success"
              : "error"
          }
          sx={{ mb: 1 }}
        />
      </Tooltip>
    </Box>
  );
};
