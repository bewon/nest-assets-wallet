import * as React from "react";
import Head from "next/head";
import { AppProps } from "next/app";
import { CacheProvider, EmotionCache } from "@emotion/react";
import createEmotionCache from "@src/utils/createEmotionCache";
import { appWithTranslation } from "next-i18next";
import AppThemeProvider from "@src/components/AppThemeProvider";
import UserSettingsProvider from "@src/components/UserSettingsProvider";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <UserSettingsProvider>
        <AppThemeProvider>
          <Component {...pageProps} />
        </AppThemeProvider>
      </UserSettingsProvider>
    </CacheProvider>
  );
}

export default appWithTranslation(MyApp);
