import { useTranslation } from "next-i18next";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React from "react";

export default function PeriodSelector(props: {
  period?: string;
  onPeriodChange: (period: string) => void;
  allPeriods: string[];
}) {
  const { t } = useTranslation();
  const value = (props.allPeriods.length > 0 && props.period) || "";
  return (
    <FormControl sx={{ width: 120 }} variant="standard">
      <InputLabel>{t("general.period")}</InputLabel>
      <Select
        name="period"
        value={value}
        label={t("general.period")}
        onChange={(e) => props.onPeriodChange(e.target.value)}
      >
        {props.allPeriods.map((period) => (
          <MenuItem key={period} value={period}>
            {period === "total" ? t("general.totalPeriod") : period}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
