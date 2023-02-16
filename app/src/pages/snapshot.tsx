import React, { useEffect, useState } from "react";
import useApi from "@src/utils/api";
import AppSnackbar, { AppSnackbarState } from "@src/components/AppSnackbar";
import { useRouter } from "next/router";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

type AssetSnapshot = {
  id: string;
  name?: string;
  group?: string;
  capital?: number;
  value?: number;
  profit?: number;
  date?: string;
};

export default function Snapshot() {
  const [assets, setAssets] = useState<AssetSnapshot[]>([]);
  const [snackbarState, setSnackbarState] = useState<AppSnackbarState>({});
  const { assetsSnapshot } = useApi();
  const route = useRouter();

  useEffect(() => {
    async function fetchAssets() {
      try {
        const response = await assetsSnapshot();
      } catch (err: any) {
        setSnackbarState({
          open: true,
          message: err.response?.data?.message ?? "An error occurred",
          severity: "error",
        });
      }
    }
    fetchAssets().catch((err) => console.error(err));
  }, [assetsSnapshot]);

  return (
    <Container maxWidth="sm" sx={{ pt: [9, 11], pb: 2 }}>
      <AppSnackbar
        state={snackbarState}
        onClose={() => setSnackbarState({ ...snackbarState, open: false })}
      />
      <Typography variant="h2" sx={{ mb: 4 }}>
        Assets Snapshot
      </Typography>
    </Container>
  );
}
