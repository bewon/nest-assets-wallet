import { AppSnackbarState } from "@src/components/AppSnackbar";
import type {
  AssetSnapshotInterface,
  AssetBalanceChangeInterface,
} from "@assets-wallet/api/src/portfolio/types";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import React, { useEffect, useMemo, useReducer, useState } from "react";
import { useTranslation } from "next-i18next";
import AssetPoint from "@src/components/AssetPoint";
import SaveIcon from "@mui/icons-material/Save";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import useApi from "@src/utils/useApi";
import { AxiosResponse } from "axios";

type SingleChangeAction = {
  type: "updateOne" | "deleteOne";
  change: AssetBalanceChangeInterface;
};
type AllChangesAction = {
  type: "updateAll";
  changes?: AssetBalanceChangeInterface[];
};

function changesReducer(
  changes: AssetBalanceChangeInterface[] | undefined,
  action: SingleChangeAction | AllChangesAction
): AssetBalanceChangeInterface[] | undefined {
  if (action.type === "updateAll") {
    return action.changes;
  }
  if (changes === undefined) {
    return undefined;
  }
  switch (action.type) {
    case "updateOne":
      return changes.map((change) =>
        change.id === action.change.id ? action.change : change
      );
    case "deleteOne":
      return changes.filter((change) => change.id !== action.change.id);
  }
}

async function setDataByApi<T>(
  makeRequest: () => Promise<AxiosResponse<T> | null>,
  setData: (data: T) => void,
  generalErrorMessage: string,
  setSnackbarState: (state: AppSnackbarState) => void
) {
  try {
    const response = await makeRequest();
    if (response?.data) {
      setData(response.data);
    }
  } catch (error: any) {
    setSnackbarState({
      open: true,
      message: error.response?.data?.message ?? generalErrorMessage,
      severity: "error",
    });
  }
}

const getCurrentYear = () => new Date().getFullYear();

export default function ChangesListDialog(props: {
  asset?: AssetSnapshotInterface;
  assetColor?: string;
  open: boolean;
  onClose: () => void;
  handleSnackbar: (state: AppSnackbarState) => void;
  onDataRefresh: () => void;
}) {
  const currentYear = getCurrentYear();
  const { t } = useTranslation();
  const api = useApi();
  const [year, setYear] = useState(currentYear);
  const [changes, dispatchChanges] = useReducer(changesReducer, undefined);
  const [dataChanged, setDataChanged] = useState(false);
  const asset = props.asset;

  const handleUpdateChange = (change: AssetBalanceChangeInterface) => {
    dispatchChanges({ type: "updateOne", change });
    setDataChanged(true);
  };

  const handleDeleteChange = (change: AssetBalanceChangeInterface) => {
    dispatchChanges({ type: "deleteOne", change });
    setDataChanged(true);
  };

  const handleClose = () => {
    if (dataChanged) {
      props.onDataRefresh();
    }
    props.onClose();
    setDataChanged(false);
  };

  useEffect(() => {
    if (asset) {
      dispatchChanges({ type: "updateAll" });
      const { makeRequest, abortRequest } = api.getAssetBalanceChanges({
        params: { assetId: asset.id, year },
      });
      setDataByApi(
        makeRequest,
        (data) => dispatchChanges({ type: "updateAll", changes: data }),
        t("general.messages.error"),
        props.handleSnackbar
      );
      return abortRequest;
    }
  }, [asset, year, t, api, props.handleSnackbar]);

  const years = useMemo(() => {
    return Array(currentYear - 1999)
      .fill(currentYear)
      .map((x, y) => x - y);
  }, [currentYear]);

  return (
    <Dialog open={props.open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          {t("assetsList.changesList")}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AssetPoint color={props.assetColor} sx={{ mr: 1 }} />
            <Typography variant="body1">{asset?.name}</Typography>
          </Box>
        </Box>
        <Select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          sx={{ mt: 1, ml: 1 }}
        >
          {years.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </DialogTitle>
      <DialogContent>
        {changes == null ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress />
          </Box>
        ) : changes.length === 0 ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Typography variant="body1">
              {t("assetsList.noChangesForYear")}
            </Typography>
          </Box>
        ) : (
          <>
            <Box sx={{ display: ["none", "flex"], pt: 1, gap: 1 }}>
              {[
                t("general.date"),
                t("assetAttributes.capital"),
                t("assetAttributes.value"),
              ].map((label) => (
                <Typography
                  key={label}
                  variant="subtitle2"
                  sx={{ minWidth: 145 }}
                >
                  {label}
                </Typography>
              ))}
            </Box>
            {asset != null &&
              changes.map((change) => (
                <BalanceChange
                  key={change.id}
                  change={change}
                  asset={asset}
                  handleSnackbar={props.handleSnackbar}
                  onUpdate={handleUpdateChange}
                  onDelete={handleDeleteChange}
                />
              ))}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t("general.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}

function BalanceChange(props: {
  change: AssetBalanceChangeInterface;
  asset: AssetSnapshotInterface;
  onUpdate: (change: AssetBalanceChangeInterface) => void;
  onDelete: (change: AssetBalanceChangeInterface) => void;
  handleSnackbar: (state: AppSnackbarState) => void;
}) {
  const { t } = useTranslation();
  const api = useApi();
  const [change, setChange] = useState(props.change);
  const isChanged = useMemo(
    () =>
      change.date !== props.change.date ||
      change.capital !== props.change.capital ||
      change.value !== props.change.value,
    [change, props.change]
  );

  const handleUpdate = async () => {
    const { makeRequest } = api.updateBalanceChange({
      data: change,
      params: { assetId: props.asset.id, changeId: change.id },
    });
    try {
      await makeRequest();
      props.onUpdate(change);
      props.handleSnackbar({
        open: true,
        message: t("assetsList.messages.changeUpdated"),
        severity: "success",
      });
    } catch (error: any) {
      props.handleSnackbar({
        open: true,
        message: error.response?.data?.message ?? t("general.messages.error"),
        severity: "error",
      });
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isChanged) {
        e.preventDefault();
        e.returnValue = t("general.messages.confirmLeave");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isChanged, t]);

  const handleDelete = async () => {
    const { makeRequest } = api.deleteBalanceChange({
      params: { assetId: props.asset.id, changeId: change.id },
    });
    try {
      await makeRequest();
      props.onDelete(change);
      props.handleSnackbar({
        open: true,
        message: t("assetsList.messages.changeDeleted"),
        severity: "success",
      });
    } catch (error: any) {
      props.handleSnackbar({
        open: true,
        message: error.response?.data?.message ?? t("general.messages.error"),
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ display: "flex", pt: 1, gap: 1, flexWrap: ["wrap", "nowrap"] }}>
      <ChangeTextField
        name="date"
        label={t("general.date")}
        value={change.date ?? ""}
        type="date"
        onChange={(value) => setChange({ ...change, date: value })}
      />
      <ChangeTextField
        name="capital"
        label={t("assetAttributes.capital")}
        value={change.capital?.toString() ?? ""}
        type="number"
        onChange={(value) => setChange({ ...change, capital: Number(value) })}
        alignRight
      />
      <ChangeTextField
        name="value"
        label={t("assetAttributes.value")}
        value={change.value?.toString() ?? ""}
        type="number"
        onChange={(value) => setChange({ ...change, value: Number(value) })}
        alignRight
      />
      <Box sx={{ display: "flex" }}>
        <LoadingIconButton
          title={t("general.save")}
          color="primary"
          disabled={!isChanged}
          onClick={handleUpdate}
        >
          <SaveIcon />
        </LoadingIconButton>
        <LoadingIconButton
          title={t("general.delete")}
          color="error"
          onClick={handleDelete}
        >
          <DeleteOutlineIcon />
        </LoadingIconButton>
      </Box>
    </Box>
  );
}

function LoadingIconButton(props: {
  onClick: () => Promise<void>;
  children: React.ReactNode;
  color: "primary" | "error";
  disabled?: boolean;
  title?: string;
}) {
  const [loading, setLoading] = useState(false);
  const handleClick = async () => {
    setLoading(true);
    await props.onClick();
    setLoading(false);
  };
  return (
    <IconButton
      title={props.title}
      color={props.color}
      component="span"
      onClick={handleClick}
      disabled={props.disabled}
      sx={{ width: 40, height: 40 }}
    >
      {loading ? <CircularProgress size={20} /> : props.children}
    </IconButton>
  );
}

function ChangeTextField(props: {
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  alignRight?: boolean;
}) {
  return (
    <TextField
      name={props.name}
      label={props.label}
      value={props.value}
      type={props.type}
      size="small"
      variant="standard"
      onChange={(e) => props.onChange(e.target.value)}
      InputLabelProps={{
        sx: { display: ["block", "none"] },
      }}
      sx={{
        minWidth: 145,
        mt: [0, -2],
        flexBasis: (theme) => [`calc(50% - ${theme.spacing(0.5)})`, "auto"],
        "& input[type=number]": {
          textAlign: props.alignRight ? "right" : "inherit",
        },
      }}
    />
  );
}
