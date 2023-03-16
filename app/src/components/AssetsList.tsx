import { Paper } from "@mui/material";
import Typography from "@mui/material/Typography";
import {
  DataGrid,
  GridActionsCellItem,
  GridColumns,
  GridRowParams,
} from "@mui/x-data-grid";
import React, { useContext, useMemo } from "react";
import type { AssetSnapshot } from "@assets-wallet/api/src/portfolio/types";
import { useTranslation } from "next-i18next";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import EditIcon from "@mui/icons-material/Edit";
import ListIcon from "@mui/icons-material/List";
import useFormat from "@src/utils/useFormat";
import { UserSettingsContext } from "@src/components/UserSettingsProvider";
import { TFunction } from "i18next";

type DialogType = "balanceUpdate" | "edit" | "changesList";

type ColumnDefinition<P> = {
  field: string;
  headerName?: string;
  type?: "number" | "date" | "actions";
  flex: number;
  valueFormatter?: (params: { value?: number }) => string;
  getActions?: (params: P) => JSX.Element[];
};

function prepareColumns<P>(
  t: TFunction<"common", undefined, "common">,
  valueFormatter: (params: { value?: number }) => string,
  getActions: (params: P) => JSX.Element[]
): ColumnDefinition<P>[] {
  return [
    { field: "name", headerName: t("assetsList.columns.name"), flex: 3 },
    {
      field: "capital",
      headerName: t("assetsList.columns.capital"),
      type: "number",
      flex: 2,
      valueFormatter,
    },
    {
      field: "value",
      headerName: t("assetsList.columns.value"),
      type: "number",
      flex: 2,
      valueFormatter,
    },
    {
      field: "profit",
      headerName: t("assetsList.columns.profit"),
      type: "number",
      flex: 2,
      valueFormatter,
    },
    {
      field: "date",
      headerName: t("assetsList.columns.date"),
      type: "date",
      flex: 2,
    },
    {
      field: "actions",
      type: "actions",
      flex: 1,
      getActions: getActions,
    },
  ];
}

export default function AssetsList(props: { assets?: AssetSnapshot[] }) {
  const { t } = useTranslation();
  const { amountFormat } = useFormat();
  const userSettings = useContext(UserSettingsContext);
  const assets = useMemo(() => {
    if (!userSettings?.hideZeroAssets || props.assets == null)
      return props.assets;
    return props.assets.filter((asset) => (asset.value ?? 0) !== 0) ?? [];
  }, [props.assets, userSettings?.hideZeroAssets]);

  const columns = React.useMemo<GridColumns<AssetSnapshot>>(() => {
    const handleDialogOpen = (type: DialogType, asset: AssetSnapshot) => {
      console.log("handleDialogOpen", type, asset);
    };

    const actions: {
      key: DialogType;
      icon: React.ReactElement;
    }[] = [
      { key: "balanceUpdate", icon: <AccountBalanceWalletIcon /> },
      { key: "changesList", icon: <ListIcon /> },
      { key: "edit", icon: <EditIcon /> },
    ];

    return prepareColumns(
      t,
      ({ value }) => amountFormat(value) ?? "-",
      (params: GridRowParams<AssetSnapshot>) =>
        actions.map((action) => (
          <GridActionsCellItem
            key={action.key}
            showInMenu
            sx={{ p: 2 }}
            label={t(`assetsList.menu.${action.key}`)}
            onClick={() => handleDialogOpen(action.key, params.row)}
            icon={action.icon}
          />
        ))
    );
  }, [t, amountFormat]);

  return (
    <Paper>
      <Typography variant="h6" sx={{ p: 2 }}>
        {t("assetsList.title")}
      </Typography>
      <DataGrid
        sx={{
          borderWidth: 0,
          "& .MuiDataGrid-columnHeader": {
            color: "text.secondary",
          },
          "& .MuiDataGrid-columnHeader:first-of-type": {
            pl: 2,
          },
          "& .MuiDataGrid-cell:first-of-type": {
            pl: 2,
            fontWeight: "bold",
          },
        }}
        rows={assets ?? []}
        columns={columns}
        autoHeight
        disableSelectionOnClick
        disableColumnMenu
        hideFooter
        loading={assets == null}
      />
    </Paper>
  );
}
