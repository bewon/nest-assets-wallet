import { AppSnackbarState } from "@src/components/AppSnackbar";
import type { AssetSnapshot } from "@assets-wallet/api/src/portfolio/types";
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
import React from "react";
import { useTranslation } from "next-i18next";
import AssetPoint from "@src/components/AssetPoint";
import SaveIcon from "@mui/icons-material/Save";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export default function ChangesListDialog(props: {
  asset?: AssetSnapshot;
  assetColor?: string;
  open: boolean;
  onClose: () => void;
  handleSnackbar: (state: AppSnackbarState) => void;
  onDataRefresh: () => void;
}) {
  const { t } = useTranslation();

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
        <Box sx={{ pt: 1, gap: 1, display: ["none", "flex"] }}>
          <Typography variant="subtitle2" sx={{ minWidth: 145 }}>
            {t("general.date")}
          </Typography>
          <Typography variant="subtitle2" sx={{ minWidth: 145 }}>
            {t("assetAttributes.capital")}
          </Typography>
          <Typography variant="subtitle2" sx={{ minWidth: 145 }}>
            {t("assetAttributes.value")}
          </Typography>
        </Box>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <>
            <Box
              key={i}
              sx={{
                display: "flex",
                pt: 1,
                gap: 1,
                flexWrap: ["wrap", "nowrap"],
              }}
            >
              <TextField
                label={t("general.date")}
                type="date"
                value="2021-08-24"
                size="small"
                variant="standard"
                InputLabelProps={{
                  sx: { display: ["block", "none"] },
                }}
                sx={{
                  minWidth: 145,
                  mt: [0, -2],
                  flexBasis: (theme) => [
                    `calc(50% - ${theme.spacing(0.5)})`,
                    "auto",
                  ],
                }}
              />
              <TextField
                label={t("assetAttributes.capital")}
                type="number"
                value="1000"
                size="small"
                variant="standard"
                InputLabelProps={{
                  sx: { display: ["block", "none"] },
                }}
                sx={{
                  minWidth: 145,
                  "& input[type=number]": {
                    textAlign: "right",
                  },
                  mt: [0, -2],
                  flexBasis: (theme) => [
                    `calc(50% - ${theme.spacing(0.5)})`,
                    "auto",
                  ],
                }}
              />
              <TextField
                label={t("assetAttributes.value")}
                type="number"
                value="1000"
                size="small"
                variant="standard"
                InputLabelProps={{
                  sx: { display: ["block", "none"] },
                }}
                sx={{
                  minWidth: 145,
                  "& input[type=number]": {
                    textAlign: "right",
                  },
                  mt: [0, -2],
                  flexBasis: (theme) => [
                    `calc(50% - ${theme.spacing(0.5)})`,
                    "auto",
                  ],
                }}
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
          </>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={props.onClose}>{t("general.close")}</Button>
      </DialogActions>
    </Dialog>
  );
}
