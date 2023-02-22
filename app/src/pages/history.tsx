import React, { useState } from "react";
import AppSnackbar, { AppSnackbarState } from "@src/components/AppSnackbar";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { i18n } from "../../next-i18next.config";
import Header from "@src/components/Header";

export default function History() {
  const [snackbarState, setSnackbarState] = useState<AppSnackbarState>({});
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
