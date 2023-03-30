import React, { useEffect, useState } from "react";
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
  Typography,
} from "@mui/material";
import type { HistoryStatistics } from "@assets-wallet/api/src/portfolio/types";
import useApi from "@src/utils/useApi";
import { useTranslation } from "next-i18next";
import TimeChart from "@src/components/TimeChart";

export default function History() {
  const [snackbarState, setSnackbarState] = useState<AppSnackbarState>({});
  const [portfolioData, setPortfolioData] =
    useState<HistoryStatistics["portfolio"]>();
  const [assetsData, setAssetsData] = useState<HistoryStatistics["assets"]>();
  const [groups, setGroups] = useState<string[]>();
  const [periods, setPeriods] = useState<string[]>(["total"]);
  const [group, setGroup] = useState<string>("");
  const [period, setPeriod] = useState<string>("total");
  const [showAssets, setShowAssets] = useState(false);

  const api = useApi();
  const { t } = useTranslation();

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
      params: { withAssets: showAssets },
    });
    makeRequest().then((response) => {
      if (response?.data) {
        setPortfolioData(response.data.portfolio);
        setAssetsData(response.data.assets);
      }
    });
    return abortRequest;
  }, [api, showAssets]);

  return (
    <>
      <Header />
      <AppSnackbar
        state={snackbarState}
        onClose={() => setSnackbarState({ ...snackbarState, open: false })}
      />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Paper sx={{ p: 2, display: "flex", gap: 2 }}>
          {groups && groups.length > 0 && (
            <TextField
              label={t("assetAttributes.group")}
              select
              value={group}
              onChange={(e) => setGroup(e.target.value)}
              sx={{ width: 200 }}
            >
              {groups?.map((group) => (
                <MenuItem key={group} value={group}>
                  {group || t("historyFilters.allGroups")}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            label={t("general.period")}
            select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            sx={{ width: 200 }}
          >
            {periods.map((period) => (
              <MenuItem key={period} value={period}>
                {period}
              </MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={
              <Switch
                checked={showAssets}
                onChange={(e) => setShowAssets(e.target.checked)}
              />
            }
            label={t("historyFilters.showAssets")}
          />
        </Paper>
        <Paper sx={{ p: 2, mt: 2 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {t("valueChart.title")}
          </Typography>
          <TimeChart assetsData={assetsData} portfolioData={portfolioData} />
        </Paper>
      </Container>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18n.defaultLocale)),
  },
});
