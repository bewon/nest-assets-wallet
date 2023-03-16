import { useTranslation } from "next-i18next";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React from "react";

export default function PeriodSelector(props: {
  period?: string;
  onPeriodChange: (period: string) => void;
  allPeriods: string[];
}) {
  const { t } = useTranslation();
  return (
    <FormControl sx={{ width: 120 }} variant="standard">
      <InputLabel id="period-selector-label">{t("general.period")}</InputLabel>
      <Select
        labelId="period-selector-label"
        value={props.period ?? ""}
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
