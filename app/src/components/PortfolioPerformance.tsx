import type { AssetSnapshot } from "@assets-wallet/api/src/portfolio/types";
import {
  Box,
  Chip,
  CircularProgress,
  List,
  ListItem,
  Paper,
  Tooltip,
} from "@mui/material";
import React, { useMemo } from "react";
import Typography from "@mui/material/Typography";
import { useTranslation } from "next-i18next";
import { groupAssets } from "@src/components/PortfolioStatusDialog";
import { TbPigMoney, TbReportMoney, TbTrendingUp } from "react-icons/tb";
import useFormat from "@src/utils/useFormat";

export default function PortfolioPerformance(props: {
  assets?: AssetSnapshot[];
}) {
  const { t } = useTranslation();
  const { amountFormat } = useFormat();
  const groupsData: Record<string, AssetSnapshot[]> = useMemo(
    () => groupAssets(props.assets ?? []),
    [props.assets]
  );
  const getAssetsList = (group: string) =>
    groupsData[group].map((asset) => asset.name).join(", ");

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">{t("portfolioPerformance.title")}</Typography>
      {props.assets == null ? (
        <CircularProgress sx={{ mt: 3, mb: 1 }} />
      ) : (
        <List sx={{ pb: 0 }}>
          {Object.keys(groupsData).map((group) => (
            <ListItem
              key={group}
              disablePadding
              sx={{
                display: "flex",
                pt: 1,
              }}
            >
              <Tooltip title={getAssetsList(group)}>
                <Typography
                  variant="subtitle2"
                  sx={{ py: 1, width: "25%", minWidth: 120 }}
                >
                  {group}
                </Typography>
              </Tooltip>
              <Box sx={{ flexGrow: 1, display: ["block", "flex"], pt: 1 }}>
                <Box sx={{ minWidth: [0, 150], mb: 1 }}>
                  <Chip
                    icon={<TbPigMoney />}
                    label={amountFormat(
                      groupsData[group].reduce(
                        (acc, asset) => acc + (asset.capital ?? 0),
                        0
                      )
                    )}
                    variant="outlined"
                  />
                </Box>
                <Box sx={{ minWidth: [0, 150], mb: 1 }}>
                  <Chip
                    icon={<TbReportMoney />}
                    label={amountFormat(
                      groupsData[group].reduce(
                        (acc, asset) => acc + (asset.value ?? 0),
                        0
                      )
                    )}
                    variant="outlined"
                    color="primary"
                  />
                </Box>
                <Chip
                  icon={<TbTrendingUp />}
                  label="- 12.6%"
                  variant="outlined"
                  sx={{ mb: 1 }}
                />
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}
