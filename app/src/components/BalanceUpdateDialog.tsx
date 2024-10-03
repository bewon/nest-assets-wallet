import React, { startTransition, useEffect, useMemo, useState } from "react";
import type { AssetSnapshotInterface } from "@assets-wallet/api/src/portfolio/types";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { AppSnackbarState } from "@src/components/AppSnackbar";
import useApi from "@src/utils/useApi";
import { FaEquals, FaPlus } from "react-icons/fa";
import AssetPoint from "@src/components/AssetPoint";

const amountRound = (amount: number) => Math.round(amount * 100) / 100;

export default function BalanceUpdateDialog(props: {
  asset?: AssetSnapshotInterface;
  assetColor?: string;
  open: boolean;
  onClose: () => void;
  handleSnackbar: (state: AppSnackbarState) => void;
  onDataRefresh: () => void;
}) {
  const initialDate = new Date().toISOString().split("T")[0];
  const [capital, setCapital] = useState<number>();
  const [value, setValue] = useState<number>();
  const [date, setDate] = useState(initialDate);
  const { t } = useTranslation();
  const api = useApi();
  const clearForm = () => {
    startTransition(() => {
      setCapital(undefined);
      setValue(undefined);
      setDate(initialDate);
    });
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!props.asset) {
      return;
    }
    const { makeRequest } = api.createBalanceChange({
      data: { capital, value, date },
      params: { assetId: props.asset.id },
    });
    try {
      await makeRequest();
      props.handleSnackbar({
        open: true,
        message: t("assetsList.messages.balanceUpdated"),
        severity: "success",
      });
      props.onDataRefresh();
      props.onClose();
      clearForm();
    } catch (error: any) {
      props.handleSnackbar({
        open: true,
        message: error.response?.data?.message ?? t("general.messages.error"),
        severity: "error",
      });
    }
  };

  useEffect(() => {
    if (!props.open) {
      clearForm();
    }
  }, [props.open]);

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>
        {t("assetsList.balanceUpdate")}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AssetPoint color={props.assetColor} sx={{ mr: 1 }} />
          <Typography variant="body1">{props.asset?.name}</Typography>
        </Box>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: "flex", gap: 2, flexWrap: ["wrap", "nowrap"] }}>
            <TextField
              name="date"
              label={t("assetsList.balanceUpdateDate")}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              sx={{ minWidth: 160 }}
            />
            <TipBox tip={t("assetsList.balanceUpdateTip")} />
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 3,
              flexWrap: ["wrap", "nowrap"],
            }}
          >
            <FormColumn
              columnType="capital"
              currentValue={props.asset?.capital}
              newValue={capital}
              onNewValueChange={setCapital}
            />
            <FormColumn
              columnType="value"
              currentValue={props.asset?.value}
              newValue={value}
              onNewValueChange={setValue}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose}>{t("general.cancel")}</Button>
          <Button type="submit" disabled={!props.asset}>
            {t("general.save")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function TipBox(props: { tip: string }) {
  const [showFullTip, setShowFullTip] = useState(false);
  const { t } = useTranslation();
  const tip = useMemo(() => {
    if (showFullTip) {
      return props.tip;
    }
    return props.tip.slice(0, 27) + "...";
  }, [props.tip, showFullTip]);
  return (
    <Alert severity="info">
      {tip}
      <Button
        color="inherit"
        size="small"
        onClick={() => setShowFullTip(!showFullTip)}
      >
        {showFullTip ? t("general.readLess") : t("general.readMore")}
      </Button>
    </Alert>
  );
}

function FormColumn(props: {
  columnType: "capital" | "value";
  currentValue?: number;
  newValue?: number;
  onNewValueChange: (newValue: number) => void;
}) {
  const { t } = useTranslation();
  const plusValue = useMemo(
    () =>
      props.newValue == null
        ? props.newValue
        : amountRound(props.newValue - (props.currentValue ?? 0)),
    [props.currentValue, props.newValue],
  );
  const handlePlusValueChange = (plusValue: number) => {
    const newValue = amountRound((props.currentValue ?? 0) + plusValue);
    props.onNewValueChange(newValue);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flexGrow: 1 }}>
      <Typography variant="h6">
        {t(`assetsList.balanceUpdateColumns.${props.columnType}.header`)}
      </Typography>
      <ColumnTextField
        disabled
        columnType={props.columnType}
        textFieldType="current"
        value={props.currentValue}
      />
      <ColumnTextField
        columnType={props.columnType}
        textFieldType="plus"
        value={plusValue}
        onChange={handlePlusValueChange}
        icon={<FaPlus />}
      />
      <ColumnTextField
        required
        columnType={props.columnType}
        textFieldType="new"
        value={props.newValue}
        onChange={props.onNewValueChange}
        icon={<FaEquals />}
      />
    </Box>
  );
}

function ColumnTextField(props: {
  columnType: "capital" | "value";
  textFieldType: "current" | "plus" | "new";
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
  required?: boolean;
}) {
  const { t } = useTranslation();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (props.onChange != null) {
      props.onChange(+e.target.value);
    }
  };
  const inputProps = useMemo(() => {
    if (props.icon != null) {
      return {
        startAdornment: (
          <InputAdornment position="start">{props.icon}</InputAdornment>
        ),
      };
    }
    return undefined;
  }, [props.icon]);
  return (
    <TextField
      name={`${props.columnType}-${props.textFieldType}`}
      label={t(
        `assetsList.balanceUpdateColumns.${props.columnType}.${props.textFieldType}`,
      )}
      value={props?.value?.toString() ?? ""}
      required={props.required}
      disabled={props.disabled}
      type="number"
      onChange={handleChange}
      InputProps={inputProps}
      sx={{
        "& input[type=number]": {
          textAlign: "right",
        },
      }}
    />
  );
}
