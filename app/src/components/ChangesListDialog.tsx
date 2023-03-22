import { AppSnackbarState } from "@src/components/AppSnackbar";
import type { AssetSnapshot } from "@assets-wallet/api/src/portfolio/types";
import { Box, Dialog, DialogTitle, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "next-i18next";
import AssetPoint from "@src/components/AssetPoint";

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
    </Dialog>
  );
}
