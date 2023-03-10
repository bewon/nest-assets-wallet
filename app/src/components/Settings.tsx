import { useTranslation } from "next-i18next";
import React, { useContext, useState } from "react";
import { useRouter } from "next/router";
import {
  Button,
  Divider,
  FormControlLabel,
  ListItem,
  ListItemIcon,
  Switch,
} from "@mui/material";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import Menu from "@mui/material/Menu";
import LanguageIcon from "@mui/icons-material/Language";
import InvertColorsIcon from "@mui/icons-material/InvertColors";
import {
  UserSettings,
  UserSettingsContext,
} from "@src/components/UserSettingsProvider";
import { ButtonProps } from "@mui/material/Button/Button";

export default function Settings() {
  const { t } = useTranslation();
  const router = useRouter();
  const userSettings = useContext(UserSettingsContext);
  const handleHideZeroAssetsChange = (checked: boolean) => {
    userSettings.setHideZeroAssets && userSettings.setHideZeroAssets(checked);
  };
  const handleThemeModeChange = (themeMode: UserSettings["themeMode"]) => {
    userSettings.setThemeMode && userSettings.setThemeMode(themeMode);
  };
  const [anchorSettings, setAnchorSettings] = useState<null | HTMLElement>(
    null
  );

  const handleOpenSettings = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorSettings(event.currentTarget);
  };

  const handleCloseSettings = () => {
    setAnchorSettings(null);
  };

  const handleLogout = () => {
    router.push("/auth/logout");
  };

  return (
    <Box sx={{ flexGrow: 0 }}>
      <Tooltip title={t("header.settings.settings")}>
        <IconButton onClick={handleOpenSettings} color="inherit" sx={{ p: 3 }}>
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      <Menu
        sx={{ mt: "45px" }}
        anchorEl={anchorSettings}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={Boolean(anchorSettings)}
        onClose={handleCloseSettings}
      >
        <ListItem>
          <Tooltip title={t("header.settings.language")}>
            <ListItemIcon>
              <LanguageIcon />
            </ListItemIcon>
          </Tooltip>
          <Box sx={{ display: "flex", gap: 1 }}>
            <LanguageButton lang="en" />
            <LanguageButton lang="pl" />
          </Box>
        </ListItem>
        <ListItem>
          <Tooltip title={t("header.settings.theme")}>
            <ListItemIcon>
              <InvertColorsIcon />
            </ListItemIcon>
          </Tooltip>
          <Box sx={{ display: "flex", gap: 1 }}>
            <ThemeModeButton
              themeMode="light"
              currentThemeMode={userSettings.themeMode}
              onClick={() => handleThemeModeChange("light")}
            />
            <ThemeModeButton
              themeMode="dark"
              currentThemeMode={userSettings.themeMode}
              onClick={() => handleThemeModeChange("dark")}
            />
          </Box>
        </ListItem>
        <Divider />
        <ListItem>
          <FormControlLabel
            control={
              <Switch
                checked={userSettings.hideZeroAssets}
                sx={{ ml: 1 }}
                onChange={(e) => handleHideZeroAssetsChange(e.target.checked)}
              />
            }
            label={t("header.settings.zeroAssets")}
            labelPlacement="start"
            sx={{ ml: 0 }}
          />
        </ListItem>
        <Divider />
        <ListItem>
          <Button variant="contained" color="primary" onClick={handleLogout}>
            {t("auth.logOut")}
          </Button>
        </ListItem>
      </Menu>
    </Box>
  );
}

function LanguageButton(props: { lang: string }) {
  const router = useRouter();
  const { i18n } = useTranslation();
  const buttonProps:
    | { variant: "outlined"; color: "secondary" }
    | Record<string, never> =
    i18n.language === props.lang
      ? { variant: "outlined", color: "secondary" }
      : {};
  const handleLanguageChange = () => {
    router.push(router.pathname, undefined, { locale: props.lang });
  };
  return (
    <Button onClick={handleLanguageChange} {...buttonProps}>
      {props.lang.toUpperCase()}
    </Button>
  );
}

function ThemeModeButton(props: {
  themeMode: UserSettings["themeMode"];
  currentThemeMode: UserSettings["themeMode"];
  onClick: () => void;
}) {
  const { t } = useTranslation();
  let buttonProps: ButtonProps = {};
  if (props.themeMode === props.currentThemeMode) {
    buttonProps = { variant: "outlined", color: "secondary" };
  }
  return (
    <Button onClick={props.onClick} {...buttonProps}>
      {t(`header.theme.${props.themeMode}`)}
    </Button>
  );
}
