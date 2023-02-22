import React, { useEffect, useState } from "react";
import useApi from "@src/utils/api";
import AppSnackbar, { AppSnackbarState } from "@src/components/AppSnackbar";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { i18n } from "../../next-i18next.config";
import Header from "@src/components/Header";
import { Grid, Paper } from "@mui/material";
import Container from "@mui/material/Container";
export default function Snapshot() {
  // const [assets, setAssets] = useState<AssetSnapshot[]>([]);
  const [snackbarState, setSnackbarState] = useState<AppSnackbarState>({});
  const api = useApi();
  const { t } = useTranslation();

  useEffect(() => {
    const { makeRequest, abortRequest } = api.getAssetsSnapshot();
    (async () => {
      try {
        const response = await makeRequest();
        console.log(response?.data);
      } catch (error: any) {
        setSnackbarState({
          open: true,
          message: error.response?.data?.message ?? t("general.messages.error"),
          severity: "error",
        });
      }
    })();
    return () => abortRequest();
  }, []);

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
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>CompositionChart</Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>PortfolioPerformance</Paper>
            </Grid>
            <Grid item xs>
              <Paper sx={{ p: 2 }}>AssetsList</Paper>
            </Grid>
          </Grid>
          <Grid item container xs={12} md spacing={2}>
            <Grid item xs>
              <Paper sx={{ p: 2 }}>AssetsPerformance</Paper>
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
