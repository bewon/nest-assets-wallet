import React from "react";

import { Alert, AlertProps, Snackbar } from "@mui/material";

export type AppSnackbarState = {
  message?: string;
  severity?: AlertProps["severity"];
  open?: boolean;
};

type AppSnackbarProps = {
  state: AppSnackbarState;
  onClose: () => void;
};

export default function AppSnackbar({ state, onClose }: AppSnackbarProps) {
  return (
    <Snackbar
      open={state.open ?? false}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    >
      <Alert
        onClose={onClose}
        severity={state.severity ?? "info"}
        sx={{ width: "100%" }}
        variant="filled"
      >
        {state.message ?? ""}
      </Alert>
    </Snackbar>
  );
}
