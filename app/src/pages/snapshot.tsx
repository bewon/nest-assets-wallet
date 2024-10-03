import React, { useEffect, useMemo, useState } from "react";
import useApi, { callApi } from "@src/utils/useApi";
import AppSnackbar, { AppSnackbarState } from "@src/components/AppSnackbar";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { i18n } from "../../next-i18next.config";
import Header from "@src/components/Header";
import { Grid } from "@mui/material";
import Container from "@mui/material/Container";
import type {
  AssetSnapshotInterface,
  PortfolioPerformanceStatistics,
} from "@assets-wallet/api/src/portfolio/types";
import AssetsList from "@src/components/AssetsList";
import PortfolioStatus from "@src/components/PortfolioStatus";
import PortfolioPerformance from "@src/components/PortfolioPerformance";
import AssetsPerformance from "@src/components/AssetsPerformance";
import Head from "next/head";
import { appName } from "@src/pages/index";

export default function Snapshot() {
  const [assets, setAssets] = useState<AssetSnapshotInterface[]>();
  const [performanceStatistics, setPerformanceStatistics] =
    useState<PortfolioPerformanceStatistics>();
  const [snackbarState, setSnackbarState] = useState<AppSnackbarState>({});
  const [period, setPeriod] = useState<string>();
  const api = useApi();
  const { t } = useTranslation();
  const generalErrorMessage = t("general.messages.error");

  const updateAssets = useMemo(
    () => () => {
      if (assets !== undefined) setAssets(undefined);
      const { makeRequest, abortRequest } = api.getAssetsSnapshot({});
      callApi(makeRequest, setAssets, generalErrorMessage, setSnackbarState);
      return abortRequest;
    },
    [generalErrorMessage, assets, api],
  );

  const updatePerformanceStatistics = useMemo(
    () => () => {
      if (performanceStatistics !== undefined)
        setPerformanceStatistics(undefined);
      const { makeRequest, abortRequest } = api.getPerformanceStatistics({});
      callApi(
        makeRequest,
        setPerformanceStatistics,
        generalErrorMessage,
        setSnackbarState,
      );
      return abortRequest;
    },
    [performanceStatistics, api, generalErrorMessage],
  );

  const periods = useMemo(() => {
    return Object.keys(performanceStatistics?.portfolio ?? {});
  }, [performanceStatistics]);

  useEffect(() => {
    const abortRequest = updateAssets();
    return () => abortRequest();
  }, []);

  useEffect(() => {
    const abortRequest = updatePerformanceStatistics();
    return () => abortRequest();
  }, []);

  const handleDataRefresh = () => {
    updateAssets();
    updatePerformanceStatistics();
  };

  useEffect(() => {
    if (periods.length > 0) {
      setPeriod(periods[0]);
    }
  }, [periods]);

  return (
    <>
      <Head>
        <title>
          {t("head.title.snapshot")} | {appName}
        </title>
      </Head>
      <Header />
      <AppSnackbar
        state={snackbarState}
        onClose={() => setSnackbarState({ ...snackbarState, open: false })}
      />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Grid container spacing={2} alignItems="flex-start">
          <Grid item container xs={12} md={8} spacing={2}>
            <Grid item xs={12}>
              <AssetsList
                assets={assets}
                handleSnackbar={setSnackbarState}
                onDataRefresh={handleDataRefresh}
              />
            </Grid>
            <Grid item xs={12}>
              <PortfolioPerformance
                assets={assets}
                performanceStatistics={performanceStatistics?.portfolio}
                periods={periods}
                period={period}
                onPeriodChange={setPeriod}
              />
            </Grid>
          </Grid>
          <Grid
            item
            container
            xs={12}
            md
            spacing={2}
            alignItems="flex-start"
            alignContent="flex-start"
          >
            <Grid item xs={12} sm={6} md={12}>
              <PortfolioStatus assets={assets} />
            </Grid>
            <Grid item xs={12} sm={6} md={12}>
              <AssetsPerformance
                assets={assets}
                performanceStatistics={performanceStatistics?.assets}
                periods={periods}
                period={period}
                onPeriodChange={setPeriod}
              />
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18n.defaultLocale)),
  },
});
