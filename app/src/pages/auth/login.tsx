import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Box, Card, CardContent } from "@mui/material";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import LoginForm from "@src/components/LoginForm";
import AppSnackbar, { AppSnackbarState } from "@src/components/AppSnackbar";
import { CardLogo } from "@src/components/CardLogo";
import { loginUser, logoutUser } from "@src/utils/session";
import useApi from "@src/utils/api";
import { useTranslation } from "next-i18next";
import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { i18n } from "../../../next-i18next.config";
import Link from "@src/components/Link";

function LangSelect({ code, label }: { code: string; label: string }) {
  const { i18n } = useTranslation();
  if (code === i18n.language) {
    return <>{label}</>;
  } else {
    return (
      <Link href="/auth/login" locale={code}>
        {label}
      </Link>
    );
  }
}

export default function Login() {
  const [snackbarState, setSnackbarState] = useState<AppSnackbarState>({});
  const handleCloseSnackbar = () => {
    setSnackbarState({ ...snackbarState, open: false });
  };
  const router = useRouter();
  const api = useApi();
  const { t } = useTranslation();

  useEffect(() => {
    logoutUser();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const { makeRequest } = api.login({ email, password });
      const response = await makeRequest();
      if (response?.data) {
        loginUser(response.data);
        await router.push("/");
      }
    } catch (err: any) {
      setSnackbarState({
        open: true,
        message: err.response?.data?.message ?? t("general.messages.error"),
        severity: "error",
      });
    }
  };
  return (
    <Container maxWidth="sm" sx={{ pt: [9, 11], pb: 2 }}>
      <AppSnackbar state={snackbarState} onClose={handleCloseSnackbar} />
      <Card sx={{ overflow: "visible" }}>
        <CardContent>
          <CardLogo />
          <Box sx={{ px: [0, 8], pt: 4, pb: [0, 7] }}>
            <Typography variant="h2" sx={{ textAlign: "center", mb: 4 }}>
              {t("auth.logIn")}
            </Typography>
            <Typography variant={"body1"} sx={{ mb: 4 }}>
              {t("auth.messages.unauthenticated")}
            </Typography>
            <LoginForm onLogin={handleLogin} />
            <Typography variant={"body1"} sx={{ mt: 4 }}>
              {t("general.language")}
              {": "}
              <LangSelect code="pl" label="polski" />
              {" | "}
              <LangSelect code="en" label="english" />
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18n.defaultLocale)),
  },
});
