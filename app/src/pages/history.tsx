import React, {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import AppSnackbar, { AppSnackbarState } from "@src/components/AppSnackbar";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { i18n } from "../../next-i18next.config";
import Header from "@src/components/Header";
import {
  CircularProgress,
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
import { UserSettingsContext } from "@src/components/UserSettingsProvider";
import dayjs from "dayjs";

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

const periods = ["", "1Y", "3Y"] as const;

export default function History() {
  const [snackbarState, setSnackbarState] = useState<AppSnackbarState>({});
  const [{ portfolioData, assetsData }, dispatchData] = useReducer(
    dataReducer,
    { portfolioData: {}, assetsData: {} } as DataState
  );
  const [groups, setGroups] = useState<string[]>();
  const [group, setGroup] = useState<string>("");
  const [period, setPeriod] = useState<(typeof periods)[number]>(periods[0]);
  const [showAssets, setShowAssets] = useState(false);
  const userSettings = useContext(UserSettingsContext);
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
    const dataMissing =
      portfolioData[group] == null || (showAssets && assetsData[group] == null);
    if (dataMissing) {
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

  const currentAssetsData = useMemo(() => {
    if (showAssets) {
      return assetsData[group]?.filter(
        (asset) => !userSettings.hideZeroAssets || (asset.value ?? 0 > 0)
      );
    }
    return undefined;
  }, [showAssets, group, assetsData, userSettings.hideZeroAssets]);

  const labels = useMemo(() => {
    const dates = (portfolioData[group] ?? []).map(([date]) => date);
    if (period === "") {
      return dates;
    } else {
      const years = period === "1Y" ? 1 : period === "3Y" ? 3 : 0;
      const startDay = dayjs().subtract(years, "year");
      return dates.filter((date) => dayjs(date).isAfter(startDay));
    }
  }, [portfolioData, group, period]);

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
          <PeriodSelect value={period} onChange={setPeriod} />
          <ShowAssetsSwitch showAssets={showAssets} onChange={setShowAssets} />
        </Paper>
        <ValueChart
          assetsData={currentAssetsData}
          portfolioData={portfolioData[group]}
          labels={labels}
        />
        <PerformanceChart
          twrPeriod="1Y"
          assetsData={currentAssetsData}
          portfolioData={portfolioData[group]}
          labels={labels}
        />
        <PerformanceChart
          twrPeriod="3Y"
          assetsData={currentAssetsData}
          portfolioData={portfolioData[group]}
          labels={labels}
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
    return <CircularProgress sx={{ m: 1 }} />;
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
  value: (typeof periods)[number];
  onChange: (value: (typeof periods)[number]) => void;
}) {
  const { t } = useTranslation();
  return (
    <TextField
      label={t("general.period")}
      select
      value={props.value}
      onChange={(e) =>
        props.onChange(e.target.value as (typeof periods)[number])
      }
      sx={{ width: 200 }}
    >
      {periods.map((period) => (
        <MenuItem key={period} value={period}>
          {t(`historyFilters.periods.${period || "total"}`)}
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
