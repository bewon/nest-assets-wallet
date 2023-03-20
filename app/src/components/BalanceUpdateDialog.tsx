import React, { startTransition, useEffect, useMemo, useState } from "react";
import type { AssetSnapshot } from "@assets-wallet/api/src/portfolio/types";
import {
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

const amountRound = (amount: number) => Math.round(amount * 100) / 100;

export default function BalanceUpdateDialog(props: {
  asset?: AssetSnapshot;
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
    // todo
  };

  useEffect(() => {
    if (!props.open) {
      clearForm();
    }
  }, [props.open]);

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>{t("assetsList.balanceUpdate")}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
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
    [props.currentValue, props.newValue]
  );
  const handlePlusValueChange = (plusValue: number) => {
    const newValue = amountRound((props.currentValue ?? 0) + plusValue);
    props.onNewValueChange(newValue);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
      label={t(
        `assetsList.balanceUpdateColumns.${props.columnType}.${props.textFieldType}`
      )}
      value={props?.value?.toString() ?? ""}
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
