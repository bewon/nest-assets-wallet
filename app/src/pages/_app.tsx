import * as React from "react";
import Head from "next/head";
import { AppProps } from "next/app";
import { CacheProvider, EmotionCache } from "@emotion/react";
import createEmotionCache from "@src/utils/createEmotionCache";
import { appWithTranslation } from "next-i18next";
import { createContext } from "react";
import AppThemeProvider from "@src/components/AppThemeProvider";

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache;
}

export type UserSettings = {
  themeMode: "light" | "dark";
  hideZeroAssets: boolean;
};

const defaultUserSettings: UserSettings = {
  themeMode: "light",
  hideZeroAssets: true,
};

export const UserSettingsContext =
  createContext<UserSettings>(defaultUserSettings);

function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <UserSettingsContext.Provider value={defaultUserSettings}>
        <AppThemeProvider>
          <Component {...pageProps} />
        </AppThemeProvider>
      </UserSettingsContext.Provider>
    </CacheProvider>
  );
}

export default appWithTranslation(MyApp);
