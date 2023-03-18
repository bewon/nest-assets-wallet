import { useTranslation } from "next-i18next";
import useApi from "@src/utils/useApi";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { AppSnackbarState } from "@src/components/AppSnackbar";

export default function NewAssetDialog(props: {
  open: boolean;
  onClose: () => void;
  handleSnackbar: (state: AppSnackbarState) => void;
}) {
  const { t } = useTranslation();
  const api = useApi();
  const [name, setName] = useState("");
  const [capital, setCapital] = useState("");
  const [value, setValue] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { makeRequest } = api.createAsset({
        data: {
          name,
          capital: Number(capital),
          value: Number(value),
          date,
        },
      });
      await makeRequest();
      props.handleSnackbar({
        open: true,
        message: t("assetsList.messages.assetCreated"),
        severity: "success",
      });
      props.onClose();
    } catch (error: any) {
      props.handleSnackbar({
        open: true,
        message: error.response?.data?.message ?? t("general.messages.error"),
        severity: "error",
      });
    }
  };

  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>{t("assetsList.newAsset")} </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexWrap: "wrap" }}>
          <NewAssetTextField
            label={t("assetAttributes.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <NewAssetTextField
            label={t("general.date")}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            type="date"
          />
          <NewAssetTextField
            label={t("assetAttributes.capital")}
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            type="number"
          />
          <NewAssetTextField
            label={t("assetAttributes.value")}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type="number"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose}>{t("general.cancel")}</Button>
          <Button type="submit">{t("general.save")}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function NewAssetTextField(props: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <TextField
      margin="dense"
      id={props.label}
      label={props.label}
      type={props.type ?? "text"}
      value={props.value}
      onChange={props.onChange}
      sx={{ mr: 1, mb: 1, minWidth: 200, flexGrow: 1 }}
    />
  );
}
