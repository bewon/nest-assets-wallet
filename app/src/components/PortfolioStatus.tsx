import { useState } from "react";
import { Button, Paper } from "@mui/material";
import Typography from "@mui/material/Typography";
import type { AssetSnapshot } from "@assets-wallet/api/src/portfolio/types";
import useFormat from "@src/utils/useFormat";
import { useTranslation } from "next-i18next";
import AssetsStatusDialog from "@src/components/AssetsStatusDialog";

export default function PortfolioStatus(props: { assets?: AssetSnapshot[] }) {
  const [open, setOpen] = useState(false);
  const { amountFormat } = useFormat();
  const { t } = useTranslation();
  const totalValue =
    props.assets != null
      ? props.assets.reduce((acc, asset) => acc + (asset.value ?? 0), 0)
      : 0;

  return (
    <Paper sx={{ px: 2, py: 3, textAlign: "center" }}>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
        {t("portfolioStatus.totalValue")}
      </Typography>
      <Typography variant="h4" sx={{ overflowWrap: "anywhere" }}>
        {amountFormat(totalValue, 0)}
      </Typography>
      <Button
        onClick={() => setOpen(true)}
        variant="outlined"
        color={"secondary"}
        sx={{ mt: 2 }}
      >
        {t("portfolioStatus.details")}
      </Button>
      <AssetsStatusDialog
        open={open}
        onClose={() => setOpen(false)}
        assets={props.assets}
      />
    </Paper>
  );
}
