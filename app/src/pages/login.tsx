import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Card, CardContent } from "@mui/material";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Image from "next/image";

interface LoginResponse {
  token: string;
}
export default function Login() {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await axios.post<LoginResponse>("/api/auth/login", {
        username,
        password,
      });
      if (response.data.token) {
        // Store the JWT token in the browser's session storage
        sessionStorage.setItem("token", response.data.token);
        await router.push("/");
      }
    } catch (err: any) {
      setError(err.response.data.message);
    }
  };
  return (
    <Container maxWidth="sm" sx={{ paddingTop: 11 }}>
      <Card sx={{ overflow: "visible" }}>
        <CardContent>
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
          <Typography variant="h3" sx={{ textAlign: "center", mt: 4 }}>
            Login
          </Typography>
          <span>{error}</span>
        </CardContent>
      </Card>
    </Container>
  );
}
