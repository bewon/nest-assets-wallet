import React from "react";
import { Box, SxProps } from "@mui/material";

export default function AssetPoint(props: { color?: string; sx?: SxProps }) {
  return (
    <Box
      sx={{
        width: 5,
        height: 15,
        borderRadius: 1,
        backgroundColor: props.color,
        ...props.sx,
      }}
    />
  );
}
