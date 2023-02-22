import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import React from "react";
import { Tab, Tabs } from "@mui/material";
import TodayIcon from "@mui/icons-material/Today";
import HistoryIcon from "@mui/icons-material/History";

export default function NavTabs() {
  const router = useRouter();
  const { t } = useTranslation();
  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    router.push(newValue);
  };
  return (
    <Tabs
      value={router.pathname}
      indicatorColor="secondary"
      aria-label="main navigation"
      onChange={handleChange}
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
  );
}
