import React, { useEffect, useState } from "react";
import useApi from "@src/utils/api";
import AppSnackbar, { AppSnackbarState } from "@src/components/AppSnackbar";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { i18n } from "../../next-i18next.config";
import Header from "@src/components/Header";

export default function Snapshot() {
  // const [assets, setAssets] = useState<AssetSnapshot[]>([]);
  const [snackbarState, setSnackbarState] = useState<AppSnackbarState>({});
  const { getAssetsSnapshot } = useApi();
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchAssets() {
      try {
        const response = await getAssetsSnapshot();
        console.log(response.data);
      } catch (err: any) {
        setSnackbarState({
          open: true,
          message: err.response?.data?.message ?? t("general.messages.error"),
          severity: "error",
        });
      }
    }
    fetchAssets().catch((err) => console.error(err));
  }, []);
  return (
    <>
      <Header />
      <AppSnackbar
        state={snackbarState}
        onClose={() => setSnackbarState({ ...snackbarState, open: false })}
      />
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18n.defaultLocale)),
  },
});
