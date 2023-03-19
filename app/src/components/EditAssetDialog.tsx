import React, { startTransition, useEffect, useState } from "react";
import type { AssetSnapshot } from "@assets-wallet/api/src/portfolio/types";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useTranslation } from "next-i18next";
import { AppSnackbarState } from "@src/components/AppSnackbar";
import useApi from "@src/utils/useApi";

export default function EditAssetDialog(props: {
  asset?: AssetSnapshot;
  open: boolean;
  onClose: () => void;
  handleSnackbar: (state: AppSnackbarState) => void;
  onDataRefresh: () => void;
  groups: string[];
}) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const { t } = useTranslation();
  const api = useApi();
  const clearForm = () => {
    startTransition(() => {
      setName("");
      setGroup("");
    });
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { makeRequest } = api.updateAsset({
        data: { name, group },
        params: { assetId: props.asset?.id },
      });
      await makeRequest();
      props.handleSnackbar({
        open: true,
        message: t("assetsList.messages.assetUpdated"),
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
  useEffect(() => {
    if (props.asset) {
      setName(props.asset.name ?? "");
      setGroup(props.asset.group ?? "");
    }
  }, [props.asset]);

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
          {props.asset && (
            <FormFields
              asset={props.asset}
              groups={props.groups}
              onNameChange={setName}
              onGroupChange={setGroup}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={props.onClose}>{t("general.cancel")}</Button>
          <Button type="submit">{t("general.save")}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function FormFields(props: {
  asset?: AssetSnapshot;
  groups: string[];
  onNameChange: (name: string) => void;
  onGroupChange: (group: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <TextField
        required
        id="name"
        label={t("assetAttributes.name")}
        value={props.asset?.name ?? ""}
        onChange={(e) => props.onNameChange(e.target.value)}
        sx={{ m: 0, flexGrow: 1, flexBasis: 200 }}
      />
      <Autocomplete
        freeSolo
        disableClearable
        id="group-autocomplete"
        options={props.groups}
        value={props.asset?.group ?? ""}
        onInputChange={(e, value) => props.onGroupChange(value)}
        sx={{ flexGrow: 1, flexBasis: 200 }}
        renderInput={(params) => (
          <TextField
            {...params}
            margin="none"
            label={t("assetAttributes.group")}
          />
        )}
      />
    </>
  );
}
