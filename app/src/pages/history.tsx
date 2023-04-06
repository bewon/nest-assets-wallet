import React, { useEffect, useReducer, useState } from "react";
import AppSnackbar, { AppSnackbarState } from "@src/components/AppSnackbar";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { i18n } from "../../next-i18next.config";
import Header from "@src/components/Header";
import {
  Container,
  FormControlLabel,
  MenuItem,
  Paper,
  Switch,
  TextField,
} from "@mui/material";
import type { HistoryStatistics } from "@assets-wallet/api/src/portfolio/types";
import useApi from "@src/utils/useApi";
import { useTranslation } from "next-i18next";
import ValueChart from "@src/components/ValueChart";
import PerformanceChart from "@src/components/PerformanceChart";

interface DataState {
  portfolioData: Record<string, HistoryStatistics["portfolio"]>;
  assetsData: Record<string, HistoryStatistics["assets"]>;
}

interface DataAction {
  group: string;
  assets: HistoryStatistics["assets"];
  portfolio: HistoryStatistics["portfolio"];
}

const dataReducer: React.Reducer<DataState, DataAction> = (state, action) => {
  return {
    portfolioData: {
      ...state.portfolioData,
      [action.group]: action.portfolio,
    },
    assetsData: {
      ...state.assetsData,
      [action.group]: action.assets,
    },
  };
};

export default function History() {
  const [snackbarState, setSnackbarState] = useState<AppSnackbarState>({});
  const [{ portfolioData, assetsData }, dispatchData] = useReducer(
    dataReducer,
    { portfolioData: {}, assetsData: {} } as DataState
  );
  const [groups, setGroups] = useState<string[]>();
  const [periods, setPeriods] = useState<string[]>(["total"]);
  const [group, setGroup] = useState<string>("");
  const [period, setPeriod] = useState<string>("total");
  const [showAssets, setShowAssets] = useState(false);
  const api = useApi();

  useEffect(() => {
    const { makeRequest, abortRequest } = api.getPortfolioGroups({});
    makeRequest().then((response) => {
      if (response?.data) {
        setGroups(["", ...response.data.filter((g) => g !== "")]);
      }
    });
    return abortRequest;
  }, [api]);

  useEffect(() => {
    const { makeRequest, abortRequest } = api.getHistoryStatistics({
      params: { withAssets: showAssets, group: group === "" ? null : group },
    });
    if (
      portfolioData[group] == null ||
      (showAssets && assetsData[group] == null)
    ) {
      makeRequest().then((response) => {
        if (response?.data) {
          dispatchData({
            group,
            assets: response.data.assets,
            portfolio: response.data.portfolio,
          });
        }
      });
    }
    return abortRequest;
  }, [api, showAssets, group]);

  return (
    <>
      <Header />
      <AppSnackbar
        state={snackbarState}
        onClose={() => setSnackbarState({ ...snackbarState, open: false })}
      />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Paper sx={{ p: 2, display: "flex", gap: 2 }}>
          <GroupSelect groups={groups} value={group} onChange={setGroup} />
          <PeriodSelect periods={periods} value={period} onChange={setPeriod} />
          <ShowAssetsSwitch showAssets={showAssets} onChange={setShowAssets} />
        </Paper>
        <ValueChart
          assetsData={showAssets ? assetsData[group] : undefined}
          portfolioData={portfolioData[group]}
        />
        <PerformanceChart
          twrPeriod="1Y"
          assetsData={showAssets ? assetsData[group] : undefined}
          portfolioData={portfolioData[group]}
        />
        <PerformanceChart
          twrPeriod="3Y"
          assetsData={showAssets ? assetsData[group] : undefined}
          portfolioData={portfolioData[group]}
        />
      </Container>
    </>
  );
}

function GroupSelect(props: {
  groups?: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  if (!props.groups || props.groups.length === 0) {
    return null;
  }
  return (
    <TextField
      label={t("assetAttributes.group")}
      select
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      sx={{ width: 200 }}
    >
      {props.groups.map((group) => (
        <MenuItem key={group} value={group}>
          {group || t("historyFilters.allGroups")}
        </MenuItem>
      ))}
    </TextField>
  );
}

function PeriodSelect(props: {
  periods: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <TextField
      label={t("general.period")}
      select
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      sx={{ width: 200 }}
    >
      {props.periods.map((period) => (
        <MenuItem key={period} value={period}>
          {period}
        </MenuItem>
      ))}
    </TextField>
  );
}

function ShowAssetsSwitch(props: {
  showAssets: boolean;
  onChange: (showAssets: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <FormControlLabel
      control={
        <Switch
          checked={props.showAssets}
          onChange={(e) => props.onChange(e.target.checked)}
        />
      }
      label={t("historyFilters.showAssets")}
    />
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18n.defaultLocale)),
  },
});
