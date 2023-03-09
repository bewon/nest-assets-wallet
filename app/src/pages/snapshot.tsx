import React, { useEffect, useState } from "react";
import useApi from "@src/utils/useApi";
import AppSnackbar, { AppSnackbarState } from "@src/components/AppSnackbar";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { i18n } from "../../next-i18next.config";
import Header from "@src/components/Header";
import { Grid, Paper } from "@mui/material";
import Container from "@mui/material/Container";
import type {
  AssetSnapshot,
  PortfolioPerformanceStatistics,
} from "@assets-wallet/api/src/portfolio/types";
import { AssetsList } from "@src/components/AssetsList";
import PortfolioStatus from "@src/components/PortfolioStatus";
import PortfolioPerformance from "@src/components/PortfolioPerformance";
import { AxiosResponse } from "axios";

async function callApi<T>(
  makeRequest: () => Promise<AxiosResponse<T> | null>,
  setData: (data: T) => void,
  generalErrorMessage: string,
  setSnackbarState: (state: AppSnackbarState) => void
) {
  try {
    const response = await makeRequest();
    if (response?.data) {
      setData(response.data);
    }
  } catch (error: any) {
    setSnackbarState({
      open: true,
      message: error.response?.data?.message ?? generalErrorMessage,
      severity: "error",
    });
  }
}

export default function Snapshot() {
  const [assets, setAssets] = useState<AssetSnapshot[]>();
  const [performanceStatistics, setPerformanceStatistics] =
    useState<PortfolioPerformanceStatistics>();
  const [snackbarState, setSnackbarState] = useState<AppSnackbarState>({});
  const api = useApi();
  const { t } = useTranslation();
  const generalErrorMessage = t("general.messages.error");

  useEffect(() => {
    const { makeRequest, abortRequest } = api.getAssetsSnapshot();
    callApi(makeRequest, setAssets, generalErrorMessage, setSnackbarState);
    return () => abortRequest();
  }, [generalErrorMessage, api]);

  useEffect(() => {
    const { makeRequest, abortRequest } = api.getPerformanceStatistics();
    callApi(
      makeRequest,
      setPerformanceStatistics,
      generalErrorMessage,
      setSnackbarState
    );
    return () => abortRequest();
  }, [generalErrorMessage, api]);

  return (
    <>
      <Header />
      <AppSnackbar
        state={snackbarState}
        onClose={() => setSnackbarState({ ...snackbarState, open: false })}
      />
      <Container maxWidth="lg" sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid item container xs={12} md={8} spacing={2}>
            <Grid item xs={12}>
              <AssetsList assets={assets} />
            </Grid>
            <Grid item xs={12}>
              <PortfolioPerformance
                assets={assets}
                performanceStatistics={performanceStatistics?.portfolio}
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
              <Paper sx={{ p: 2 }}>Assets Performance</Paper>
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
