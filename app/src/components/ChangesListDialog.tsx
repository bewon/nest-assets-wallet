import { AppSnackbarState } from "@src/components/AppSnackbar";
import type { AssetSnapshotInterface } from "@assets-wallet/api/src/portfolio/types";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import React, { Fragment, useReducer } from "react";
import { useTranslation } from "next-i18next";
import AssetPoint from "@src/components/AssetPoint";
import SaveIcon from "@mui/icons-material/Save";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import useApi from "@src/utils/useApi";

export default function ChangesListDialog(props: {
  asset?: AssetSnapshotInterface;
  assetColor?: string;
  open: boolean;
  onClose: () => void;
  handleSnackbar: (state: AppSnackbarState) => void;
  onDataRefresh: () => void;
}) {
  const { t } = useTranslation();
  const api = useApi();
  // const [changes, dispatchChanges] = useReducer(

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>
        {t("assetsList.changesList")}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <AssetPoint color={props.assetColor} sx={{ mr: 1 }} />
          <Typography variant="body1">{props.asset?.name}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: ["none", "flex"], pt: 1, gap: 1 }}>
          {[
            t("general.date"),
            t("assetAttributes.capital"),
            t("assetAttributes.value"),
          ].map((label) => (
            <Typography key={label} variant="subtitle2" sx={{ minWidth: 145 }}>
              {label}
            </Typography>
          ))}
        </Box>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <Fragment key={i.toString()}>
            <Box
              sx={{
                display: "flex",
                pt: 1,
                gap: 1,
                flexWrap: ["wrap", "nowrap"],
              }}
            >
              <ChangeTextField
                label={t("general.date")}
                value="2021-08-24"
                type="date"
                onChange={() => {}}
              />
              <ChangeTextField
                label={t("assetAttributes.capital")}
                value="1000"
                type="number"
                onChange={() => {}}
                alignRight
              />
              <ChangeTextField
                label={t("assetAttributes.value")}
                value="1000"
                type="number"
                onChange={() => {}}
                alignRight
              />
              <Box sx={{ display: "flex" }}>
                <IconButton color="primary" aria-label="save" component="span">
                  <SaveIcon />
                </IconButton>
                <IconButton color="error" aria-label="delete" component="span">
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            </Box>
            <Divider sx={{ display: ["block", "none"], mt: 3, mb: 2 }} />
          </Fragment>
        ))}
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
