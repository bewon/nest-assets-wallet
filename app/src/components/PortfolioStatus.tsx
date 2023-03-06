import { useState } from "react";
import { Button, CircularProgress, Paper } from "@mui/material";
import Typography from "@mui/material/Typography";
import type { AssetSnapshot } from "@assets-wallet/api/src/portfolio/types";
import useFormat from "@src/utils/useFormat";
import { useTranslation } from "next-i18next";
import PortfolioStatusDialog from "@src/components/PortfolioStatusDialog";

export default function PortfolioStatus(props: { assets?: AssetSnapshot[] }) {
  const [open, setOpen] = useState(false);
  const { amountFormat } = useFormat();
  const { t } = useTranslation();
  const calculateTotalValue = (assets: AssetSnapshot[]) =>
    assets.reduce((acc, asset) => acc + (asset.value ?? 0), 0);

  return (
    <Paper sx={{ px: 2, py: 3, textAlign: "center" }}>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
        {t("portfolioStatus.totalValue")}
      </Typography>
      {props.assets == null ? (
        <CircularProgress sx={{ mt: 3, mb: 1 }} />
      ) : (
        <>
          <Typography variant="h4" sx={{ overflowWrap: "anywhere" }}>
            {amountFormat(calculateTotalValue(props.assets), 0)}
          </Typography>
          <Button
            onClick={() => setOpen(true)}
            variant="outlined"
            color={"secondary"}
            sx={{ mt: 2 }}
          >
            {t("portfolioStatus.details")}
          </Button>
          <PortfolioStatusDialog
            open={open}
            onClose={() => setOpen(false)}
            assets={props.assets}
          />
        </>
      )}
    </Paper>
  );
}
