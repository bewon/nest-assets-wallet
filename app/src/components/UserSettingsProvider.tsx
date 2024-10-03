import {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useReducer,
} from "react";

const themeModes = ["light", "dark"] as const;

export type UserSettings = {
  themeMode: (typeof themeModes)[number];
  hideZeroAssets: boolean;
  setThemeMode?: (themeMode: UserSettings["themeMode"]) => void;
  setHideZeroAssets?: (hideZeroAssets: boolean) => void;
};

export const defaultUserSettings: UserSettings = {
  themeMode: "light",
  hideZeroAssets: true,
};
export const UserSettingsContext =
  createContext<UserSettings>(defaultUserSettings);

const themeModeKey = "user-settings.theme-mode";
const hideZeroAssetsKey = "user-settings.hide-zero-assets";

const reducer = (
  state: Pick<UserSettings, "themeMode" | "hideZeroAssets">,
  action: {
    themeMode?: UserSettings["themeMode"];
    hideZeroAssets?: UserSettings["hideZeroAssets"];
  },
) => {
  const stateUpdate: Partial<typeof state> = {};
  if (action.themeMode != null) {
    stateUpdate.themeMode = action.themeMode;
    localStorage.setItem(themeModeKey, action.themeMode);
  }
  if (action.hideZeroAssets != null) {
    stateUpdate.hideZeroAssets = action.hideZeroAssets;
    localStorage.setItem(hideZeroAssetsKey, action.hideZeroAssets.toString());
  }
  return { ...state, ...stateUpdate };
};

export default function UserSettingsProvider(props: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, defaultUserSettings);

  useEffect(() => {
    const rawThemeMode = localStorage.getItem(themeModeKey);
    const themeMode = themeModes.find((mode) => mode === rawThemeMode);
    const rawHideZeroAssets = localStorage.getItem(hideZeroAssetsKey);
    const hideZeroAssets =
      rawHideZeroAssets != null ? rawHideZeroAssets === "true" : undefined;
    dispatch({ themeMode, hideZeroAssets });
  }, []);

  const value = useMemo<UserSettings>(
    () => ({
      ...state,
      setThemeMode: (themeMode) => dispatch({ themeMode }),
      setHideZeroAssets: (hideZeroAssets) => dispatch({ hideZeroAssets }),
    }),
    [state],
  );

  return (
    <UserSettingsContext.Provider value={value}>
      {props.children}
    </UserSettingsContext.Provider>
  );
}
