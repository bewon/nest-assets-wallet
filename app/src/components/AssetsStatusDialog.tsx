import type { AssetSnapshot } from "@assets-wallet/api/src/portfolio/types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export default function AssetsStatusDialog(props: {
  open: boolean;
  onClose: () => void;
  assets?: AssetSnapshot[];
}) {
  const handleClose = props.onClose;
  return (
    <Dialog open={props.open} onClose={handleClose}>
      <DialogTitle>Assets Status</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {props.assets?.map((asset) => (
            <div key={asset.id}>
              {asset.name} - {asset.value}
            </div>
          ))}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
