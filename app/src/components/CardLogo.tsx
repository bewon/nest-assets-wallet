import { Card, CardContent } from "@mui/material";
import Image from "next/image";
import React from "react";

export default function CardLogo() {
  return (
    <Card
      sx={{
        borderRadius: "100%",
        width: 180,
        height: 180,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "-75px auto 0 auto",
      }}
      elevation={2}
    >
      <CardContent sx={{ paddingTop: 3 }}>
        <Image
          src={"/images/assets-wallet-icon--92.png"}
          alt="logo"
          width={92}
          height={74}
        />
      </CardContent>
    </Card>
  );
}
