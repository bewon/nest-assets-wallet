import { createContext, ReactNode, useMemo, useState } from "react";

export type UserSettings = {
  themeMode: "light" | "dark";
  hideZeroAssets: boolean;
  setThemeMode?: (themeMode: "light" | "dark") => void;
  setHideZeroAssets?: (hideZeroAssets: boolean) => void;
};
export const defaultUserSettings: UserSettings = {
  themeMode: "light",
  hideZeroAssets: true,
};
export const UserSettingsContext =
  createContext<UserSettings>(defaultUserSettings);

export default function UserSettingsProvider(props: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<UserSettings["themeMode"]>(
    defaultUserSettings.themeMode
  );
  const [hideZeroAssets, setHideZeroAssets] = useState<
    UserSettings["hideZeroAssets"]
  >(defaultUserSettings.hideZeroAssets);
  const value = useMemo(
    () => ({
      themeMode,
      hideZeroAssets,
      setThemeMode,
      setHideZeroAssets,
    }),
    [themeMode, hideZeroAssets]
  );
  return (
    <UserSettingsContext.Provider value={value}>
      {props.children}
    </UserSettingsContext.Provider>
  );
}
