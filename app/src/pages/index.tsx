import * as React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "@src/components/Link";
import { useEffect, useState } from "react";
import { getSessionData } from "@src/utils/session";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetStaticProps } from "next";
import { i18n } from "next-i18next.config";

export default function Home() {
  const [userEmail, setUserEmail] = useState<string | undefined>();
  const { t } = useTranslation();

  useEffect(() => {
    const session = getSessionData();
    if (session) {
      setUserEmail(session.userEmail);
    }
  }, []);

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          my: 4,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          AssetsWallet
        </Typography>
        {userEmail ? (
          <>
            <Typography variant="h6" component="h2" gutterBottom>
              Welcome {userEmail}
            </Typography>
            <Link href="/auth/logout" color="secondary">
              {t("auth.logOut")}
            </Link>
          </>
        ) : (
          <Link href="/auth/login" color="secondary">
            Go to the login page
          </Link>
        )}
      </Box>
    </Container>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18n.defaultLocale)),
  },
});
