import { useTranslation } from "next-i18next";
import useApi from "@src/utils/useApi";
import { startTransition, useState } from "react";
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
  onDataRefresh: () => void;
}) {
  const { t } = useTranslation();
  const api = useApi();
  const initialDate = new Date().toISOString().split("T")[0];
  const [name, setName] = useState("");
  const [capital, setCapital] = useState("0");
  const [value, setValue] = useState("0");
  const [date, setDate] = useState(initialDate);
  const clearForm = () => {
    startTransition(() => {
      setName("");
      setCapital("0");
      setValue("0");
      setDate(initialDate);
    });
  };

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
      props.onDataRefresh();
      props.onClose();
      clearForm();
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
        <DialogContent
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
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
      required
      id={props.label}
      label={props.label}
      type={props.type ?? "text"}
      value={props.value}
      onChange={props.onChange}
      sx={{ m: 0, flexGrow: 1, flexBasis: 200 }}
    />
  );
}
