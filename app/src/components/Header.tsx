import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import HistoryIcon from "@mui/icons-material/History";
import IconButton from "@mui/material/IconButton";
import Image from "next/image";
import Link from "@src/components/Link";
import Menu from "@mui/material/Menu";
import React, { useState } from "react";
import SettingsIcon from "@mui/icons-material/Settings";
import TodayIcon from "@mui/icons-material/Today";
import Tooltip from "@mui/material/Tooltip";
import { AppBar, Tab, Tabs, Toolbar } from "@mui/material";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

export default function Header() {
  const { t } = useTranslation();
  const router = useRouter();
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
          <Tabs
            value={router.pathname}
            indicatorColor="secondary"
            aria-label="main navigation"
            sx={{
              "& .MuiTab-root": {
                fontSize: [0, "0.875rem"],
                "& .MuiTab-iconWrapper": {
                  mr: [0, 1],
                },
              },
            }}
          >
            <Tab
              label={t("header.menu.today")}
              icon={<TodayIcon />}
              iconPosition="start"
              value="/snapshot"
            />
            <Tab
              label={t("header.menu.history")}
              icon={<HistoryIcon />}
              iconPosition="start"
              value="/history"
            />
          </Tabs>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title={t("header.settings")}>
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
              id="menu-appbar"
              anchorEl={anchorSettings}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorSettings)}
              onClose={handleCloseSettings}
            ></Menu>
          </Box>
        </Container>
        <Box sx={{ minWidth: 46, mr: 2 }} />
      </Toolbar>
    </AppBar>
  );
}
