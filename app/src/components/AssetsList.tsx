import { Paper } from "@mui/material";
import Typography from "@mui/material/Typography";
import {
  DataGrid,
  GridActionsCellItem,
  GridColumns,
  GridRowParams,
} from "@mui/x-data-grid";
import React from "react";
import type { AssetSnapshot } from "@assets-wallet/api/src/portfolio/types";
import { useTranslation } from "next-i18next";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import EditIcon from "@mui/icons-material/Edit";
import ListIcon from "@mui/icons-material/List";
import useFormat from "@src/utils/useFormat";

type DialogType = "balanceUpdate" | "edit" | "changesList";

export default function AssetsList(props: { assets?: AssetSnapshot[] }) {
  const { t } = useTranslation();
  const { amountFormat } = useFormat();

  const columns = React.useMemo<GridColumns<AssetSnapshot>>(() => {
    const handleDialogOpen = (type: DialogType, asset: AssetSnapshot) => {
      console.log("handleDialogOpen", type, asset);
    };
    const getActionProps = (
      type: DialogType
    ): React.ComponentProps<typeof GridActionsCellItem> => {
      return {
        showInMenu: true,
        sx: { p: 2 },
        label: t(`assetsList.menu.${type}`),
      };
    };
    return [
      { field: "name", headerName: t("assetsList.columns.name"), flex: 3 },
      {
        field: "capital",
        headerName: t("assetsList.columns.capital"),
        type: "number",
        flex: 2,
        valueFormatter: ({ value }) => amountFormat(value) ?? "-",
      },
      {
        field: "value",
        headerName: t("assetsList.columns.value"),
        type: "number",
        flex: 2,
        valueFormatter: ({ value }) => amountFormat(value) ?? "-",
      },
      {
        field: "profit",
        headerName: t("assetsList.columns.profit"),
        type: "number",
        flex: 2,
        valueFormatter: ({ value }) => amountFormat(value) ?? "-",
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
        getActions: (params: GridRowParams<AssetSnapshot>) => [
          <GridActionsCellItem
            {...getActionProps("balanceUpdate")}
            key="balanceUpdate"
            icon={<AccountBalanceWalletIcon />}
            onClick={() => handleDialogOpen("balanceUpdate", params.row)}
          />,
          <GridActionsCellItem
            {...getActionProps("changesList")}
            key="changesList"
            icon={<ListIcon />}
            onClick={() => handleDialogOpen("changesList", params.row)}
          />,
          <GridActionsCellItem
            {...getActionProps("edit")}
            key="edit"
            icon={<EditIcon />}
            onClick={() => handleDialogOpen("edit", params.row)}
          />,
        ],
      },
    ];
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
        rows={props.assets ?? []}
        columns={columns}
        autoHeight
        disableSelectionOnClick
        disableColumnMenu
        hideFooter
        loading={props.assets == null}
      />
    </Paper>
  );
}
