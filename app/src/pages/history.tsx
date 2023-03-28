import React, { useEffect, useState } from "react";
import AppSnackbar, { AppSnackbarState } from "@src/components/AppSnackbar";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { i18n } from "../../next-i18next.config";
import Header from "@src/components/Header";
import { Container, Paper } from "@mui/material";
import type { HistoryStatistics } from "@assets-wallet/api/src/portfolio/types";
import useApi from "@src/utils/useApi";

export default function History() {
  const [snackbarState, setSnackbarState] = useState<AppSnackbarState>({});
  const [portfolioData, setPortfolioData] =
    useState<HistoryStatistics["portfolio"]>();
  const [assetsData, setAssetsData] = useState<HistoryStatistics["assets"]>();
  const [groups, setGroups] = useState<string[]>();
  const api = useApi();

  useEffect(() => {
    const { makeRequest, abortRequest } = api.getPortfolioGroups({});
    makeRequest().then((response) => {
      if (response?.data) {
        setGroups(response.data);
      }
    });
    return abortRequest;
  }, [api]);

  useEffect(() => {
    const { makeRequest, abortRequest } = api.getHistoryStatistics({});
    makeRequest().then((response) => {
      if (response?.data) {
        setPortfolioData(response.data.portfolio);
        setAssetsData(response.data.assets);
      }
    });
    return abortRequest;
  }, [api]);

  return (
    <>
      <Header />
      <AppSnackbar
        state={snackbarState}
        onClose={() => setSnackbarState({ ...snackbarState, open: false })}
      />
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Paper sx={{ p: 2 }}></Paper>
      </Container>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18n.defaultLocale)),
  },
});
