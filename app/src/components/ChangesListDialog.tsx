import { AppSnackbarState } from "@src/components/AppSnackbar";
import type { AssetSnapshot } from "@assets-wallet/api/src/portfolio/types";
import { Dialog, DialogTitle, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "next-i18next";

export default function ChangesListDialog(props: {
  asset?: AssetSnapshot;
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
        <Typography variant="body1">{props.asset?.name}</Typography>
      </DialogTitle>
    </Dialog>
  );
}
