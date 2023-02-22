import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Image from "next/image";
import Link from "@src/components/Link";
import Menu from "@mui/material/Menu";
import React, { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import Tooltip from "@mui/material/Tooltip";
import {
  AppBar,
  Button,
  Divider,
  FormControlLabel,
  ListItem,
  ListItemIcon,
  Switch,
  Toolbar,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import NavTabs from "@src/components/NavTabs";
import LanguageIcon from "@mui/icons-material/Language";
import InvertColorsIcon from "@mui/icons-material/InvertColors";
import { useRouter } from "next/router";

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

export default function Header() {
  const { t } = useTranslation();
  const [anchorSettings, setAnchorSettings] = useState<null | HTMLElement>(
    null
  );

  const handleOpenSettings = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorSettings(event.currentTarget);
  };

  const handleCloseSettings = () => {
    setAnchorSettings(null);
  };

  return (
    <AppBar position="static">
      <Toolbar disableGutters>
        <Link href="/" sx={{ ml: 2 }}>
          <Image
            src={"/images/assets-wallet-icon--46.png"}
            alt="logo"
            width={46}
            height={37}
          />
        </Link>
        <Container
          maxWidth="lg"
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <NavTabs />
          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title={t("header.settings.settings")}>
              <IconButton
                onClick={handleOpenSettings}
                color="inherit"
                sx={{ p: 3 }}
              >
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
                <Box>
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
                <Box>
                  <Button variant="outlined" color="secondary">
                    {t("header.theme.light")}
                  </Button>
                  <Button>{t("header.theme.dark")}</Button>
                </Box>
              </ListItem>
              <Divider />
              <ListItem>
                <FormControlLabel
                  control={<Switch checked={false} />}
                  label={t("header.settings.zero-assets")}
                  labelPlacement="start"
                />
              </ListItem>
              <Divider />
              <ListItem>
                <Button variant="contained" color="primary">
                  {t("auth.log-out")}
                </Button>
              </ListItem>
            </Menu>
          </Box>
        </Container>
        <Box sx={{ minWidth: 46, mr: 2 }} />
      </Toolbar>
    </AppBar>
  );
}
