import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Image from "next/image";
import Link from "@src/components/Link";
import React from "react";
import { AppBar, Toolbar } from "@mui/material";
import NavTabs from "@src/components/NavTabs";
import Settings from "@src/components/Settings";

export default function Header() {
  return (
    <AppBar position="static">
      <Toolbar disableGutters>
        <Link href="/" sx={{ ml: 2 }}>
          <Image
            src={"/images/assets-wallet-icon--46.png"}
            alt="logo"
            width={46}
            height={37}
          />
        </Link>
        <Container
          maxWidth="lg"
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          <NavTabs />
          <Settings />
        </Container>
        <Box sx={{ minWidth: 46, mr: 2 }} />
      </Toolbar>
    </AppBar>
  );
}
