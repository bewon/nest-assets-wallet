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

async function callApi<T>(
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

  useEffect(() => {
    if (props.asset) {
      dispatchChanges({ type: "updateAll" });
      const { makeRequest, abortRequest } = api.getAssetBalanceChanges({
        params: { assetId: props.asset.id, year },
      });
      callApi(
        makeRequest,
        (data) => dispatchChanges({ type: "updateAll", changes: data }),
        t("general.messages.error"),
        props.handleSnackbar
      );
      return abortRequest;
    }
  }, [props.asset, year, t]);

  const years = useMemo(() => {
    return Array(currentYear - 1999)
      .fill(currentYear)
      .map((x, y) => x - y);
  }, [currentYear]);
  // set minimal width for the dialog
  return (
    <Dialog open={props.open} onClose={props.onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box>
          {t("assetsList.changesList")}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <AssetPoint color={props.assetColor} sx={{ mr: 1 }} />
            <Typography variant="body1">{props.asset?.name}</Typography>
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
        {changes === undefined ? (
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
            {changes.map((change) => (
              <Box
                key={change.id}
                sx={{
                  display: "flex",
                  pt: 1,
                  gap: 1,
                  flexWrap: ["wrap", "nowrap"],
                }}
              >
                <ChangeTextField
                  label={t("general.date")}
                  value={change.date ?? ""}
                  type="date"
                  onChange={() => {}}
                />
                <ChangeTextField
                  label={t("assetAttributes.capital")}
                  value={change.capital?.toString() ?? ""}
                  type="number"
                  onChange={() => {}}
                  alignRight
                />
                <ChangeTextField
                  label={t("assetAttributes.value")}
                  value={change.value?.toString() ?? ""}
                  type="number"
                  onChange={() => {}}
                  alignRight
                />
                <Box sx={{ display: "flex" }}>
                  <IconButton
                    color="primary"
                    aria-label="save"
                    component="span"
                  >
                    <SaveIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    aria-label="delete"
                    component="span"
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>{t("general.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}

function ChangeTextField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  alignRight?: boolean;
}) {
  return (
    <TextField
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
