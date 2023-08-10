import * as React from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { useEffect } from "react";
import { getSessionData } from "@src/utils/session";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import { i18n } from "next-i18next.config";
import { useRouter } from "next/router";
import { CircularProgress } from "@mui/material";
import Head from "next/head";

export const appName = "AssetsWallet";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const session = getSessionData();
    router.push(session ? "/snapshot" : "/auth/login");
  }, []);

  return (
    <Container maxWidth="lg">
      <Head>
        <title>{appName}</title>
      </Head>
      <Box sx={{ display: "flex", justifyContent: "center", p: 4, mt: 8 }}>
        <CircularProgress sx={{ m: 1 }} />
      </Box>
    </Container>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18n.defaultLocale)),
  },
});
