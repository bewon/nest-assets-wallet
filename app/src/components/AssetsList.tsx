import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  useMediaQuery,
  Menu,
  CircularProgress,
  Box,
  Tooltip,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import {
  DataGrid,
  GridActionsCellItem,
  GridColumns,
  GridMoreVertIcon,
  GridRowParams,
} from "@mui/x-data-grid";
import React, { useContext, useMemo, useState } from "react";
import type { AssetSnapshotInterface } from "@assets-wallet/api/src/portfolio/types";
import { useTranslation } from "next-i18next";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import EditIcon from "@mui/icons-material/Edit";
import ListIcon from "@mui/icons-material/List";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import useFormat from "@src/utils/useFormat";
import { UserSettingsContext } from "@src/components/UserSettingsProvider";
import { TFunction } from "i18next";
import type { Theme } from "@mui/material/styles";
import NewAssetDialog from "@src/components/NewAssetDialog";
import { AppSnackbarState } from "@src/components/AppSnackbar";
import EditAssetDialog from "@src/components/EditAssetDialog";
import BalanceUpdateDialog from "@src/components/BalanceUpdateDialog";
import ChangesListDialog from "@src/components/ChangesListDialog";
import { assetsPalette } from "@src/utils/theme";

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
    { field: "name", headerName: t("assetAttributes.name"), flex: 3 },
    {
      field: "capital",
      headerName: t("assetAttributes.capital"),
      type: "number",
      flex: 2,
      valueFormatter,
    },
    {
      field: "value",
      headerName: t("assetAttributes.value"),
      type: "number",
      flex: 2,
      valueFormatter,
    },
    {
      field: "profit",
      headerName: t("assetAttributes.profit"),
      type: "number",
      flex: 2,
      valueFormatter,
    },
    {
      field: "date",
      headerName: t("assetAttributes.date"),
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

const actions: {
  key: DialogType;
  getIcon: () => React.ReactElement;
}[] = [
  { key: "balanceUpdate", getIcon: () => <AccountBalanceWalletIcon /> },
  { key: "changesList", getIcon: () => <ListIcon /> },
  { key: "edit", getIcon: () => <EditIcon /> },
];

export default function AssetsList(props: {
  assets?: AssetSnapshotInterface[];
  handleSnackbar: (state: AppSnackbarState) => void;
  onDataRefresh: () => void;
}) {
  const { t } = useTranslation();
  const userSettings = useContext(UserSettingsContext);
  const [newAssetDialogOpen, setNewAssetDialogOpen] = useState(false);
  const [assetDialog, setAssetDialog] = useState<{
    type: DialogType;
    asset: AssetSnapshotInterface;
  } | null>(null);

  const assets = useMemo(() => {
    if (!userSettings?.hideZeroAssets || props.assets == null)
      return props.assets;
    return props.assets.filter((asset) => (asset.value ?? 0) !== 0) ?? [];
  }, [props.assets, userSettings?.hideZeroAssets]);

  const groups = useMemo(() => {
    if (props.assets == null) return [];
    return Array.from(
      new Set(props.assets.map((asset) => asset.group ?? ""))
    ).filter((group) => group !== "");
  }, [props.assets]);

  const gridFits = useMediaQuery<Theme>((theme) => theme.breakpoints.up("sm"));

  const handleAssetDialogOpen = (
    type: DialogType,
    asset: AssetSnapshotInterface
  ) => {
    setAssetDialog({ type, asset });
  };

  const assetColor = useMemo(() => {
    if (assetDialog?.asset == null) return undefined;
    const index = props.assets?.findIndex((a) => a.id === assetDialog.asset.id);
    return index != null
      ? assetsPalette[index % assetsPalette.length]
      : undefined;
  }, [assetDialog?.asset, props.assets]);

  return (
    <Paper>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 1 }}>
        <Typography variant="h6" sx={{ mr: 1, pt: 1, pl: 1 }}>
          {t("assetsList.title")}
        </Typography>
        <Tooltip title={t("assetsList.newAsset")}>
          <IconButton onClick={() => setNewAssetDialogOpen(true)}>
            <AddCircleOutlineIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <NewAssetDialog
        open={newAssetDialogOpen}
        onClose={() => setNewAssetDialogOpen(false)}
        handleSnackbar={props.handleSnackbar}
        onDataRefresh={props.onDataRefresh}
      />
      <EditAssetDialog
        open={assetDialog?.type === "edit"}
        asset={assetDialog?.asset}
        onClose={() => setAssetDialog(null)}
        handleSnackbar={props.handleSnackbar}
        onDataRefresh={props.onDataRefresh}
        groups={groups}
      />
      <BalanceUpdateDialog
        open={assetDialog?.type === "balanceUpdate"}
        asset={assetDialog?.asset}
        assetColor={assetColor}
        onClose={() => setAssetDialog(null)}
        handleSnackbar={props.handleSnackbar}
        onDataRefresh={props.onDataRefresh}
      />
      <ChangesListDialog
        open={assetDialog?.type === "changesList"}
        asset={assetDialog?.asset}
        assetColor={assetColor}
        onClose={() => setAssetDialog(null)}
        handleSnackbar={props.handleSnackbar}
        onDataRefresh={props.onDataRefresh}
      />
      {gridFits ? (
        <AssetsGrid assets={assets} onDialogOpen={handleAssetDialogOpen} />
      ) : assets == null ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3, pt: 1 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {assets?.map((asset) => (
            <NarrowAssetsListItem
              key={asset.id}
              asset={asset}
              onDialogOpen={(type) => handleAssetDialogOpen(type, asset)}
            />
          ))}
        </List>
      )}
    </Paper>
  );
}

function AssetsGrid(props: {
  assets?: AssetSnapshotInterface[];
  onDialogOpen: (type: DialogType, asset: AssetSnapshotInterface) => void;
}) {
  const { t } = useTranslation();
  const { amountFormat } = useFormat();
  const handleDialogOpen = props.onDialogOpen;

  const columns = useMemo<GridColumns<AssetSnapshotInterface>>(() => {
    return prepareColumns(
      t,
      ({ value }) => amountFormat(value) ?? "-",
      (params: GridRowParams<AssetSnapshotInterface>) =>
        actions.map((action) => (
          <GridActionsCellItem
            key={action.key}
            showInMenu
            sx={{ p: 2 }}
            label={t(`assetsList.menu.${action.key}`)}
            onClick={() => handleDialogOpen(action.key, params.row)}
            icon={action.getIcon()}
          />
        ))
    );
  }, [t, amountFormat, handleDialogOpen]);

  return (
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
  );
}

function NarrowAssetsListItem(props: {
  asset: AssetSnapshotInterface;
  onDialogOpen: (type: DialogType) => void;
}) {
  const { t } = useTranslation();
  const { amountFormat, dateFormat } = useFormat();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const assetSummary = useMemo(() => {
    const date = props.asset.date == null ? null : new Date(props.asset.date);
    return (
      <>
        <NarrowAssetSummary
          label={t("assetAttributes.capital")}
          value={amountFormat(props.asset.capital)}
        />
        {" · "}
        <NarrowAssetSummary
          label={t("assetAttributes.value")}
          value={amountFormat(props.asset.value)}
        />
        {" · "}
        <NarrowAssetSummary
          label={t("assetAttributes.profit")}
          value={amountFormat(props.asset.profit)}
        />
        {" · "}
        <NarrowAssetSummary
          label={t("assetAttributes.date")}
          value={date == null ? "-" : dateFormat(date)}
        />
      </>
    );
  }, [props.asset, amountFormat, dateFormat, t]);

  return (
    <>
      <ListItem
        key={props.asset.id}
        secondaryAction={
          <IconButton edge="end" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <GridMoreVertIcon />
          </IconButton>
        }
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          "&:last-of-type": {
            borderBottom: 0,
          },
        }}
      >
        <ListItemText primary={props.asset.name} secondary={assetSummary} />
      </ListItem>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {actions.map((action) => (
          <MenuItem
            key={action.key}
            onClick={() => props.onDialogOpen(action.key)}
          >
            <ListItemIcon>{action.getIcon()}</ListItemIcon>
            <ListItemText>{t(`assetsList.menu.${action.key}`)}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function NarrowAssetSummary(props: { label: string; value: string | null }) {
  return (
    <Typography
      key={props.label}
      component="span"
      sx={{ whiteSpace: "nowrap" }}
    >
      <Typography component="span" variant="caption" sx={{ opacity: 0.7 }}>
        {props.label + ": "}
      </Typography>
      {props.value ?? "-"}
    </Typography>
  );
}
