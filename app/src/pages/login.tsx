import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { Box, Card, CardContent } from "@mui/material";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import LoginForm from "@src/components/LoginForm";
import AppSnackbar, { AppSnackbarState } from "@src/components/AppSnackbar";
import { CardLogo } from "@src/components/CardLogo";

interface LoginResponse {
  token: string;
}

export default function Login() {
  const [snackbarState, setSnackbarState] = useState<AppSnackbarState>({});
  const handleCloseSnackbar = () => {
    setSnackbarState({ ...snackbarState, open: false });
  };
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
      setSnackbarState({
        open: true,
        message: err.response?.data?.message ?? "An error occurred",
        severity: "error",
      });
    }
  };
  return (
    <Container maxWidth="sm" sx={{ pt: [9, 11], pb: 2 }}>
      <AppSnackbar state={snackbarState} onClose={handleCloseSnackbar} />
      <Card sx={{ overflow: "visible" }}>
        <CardContent>
          <CardLogo />
          <Box sx={{ px: [0, 8], pt: 4, pb: [0, 7] }}>
            <Typography variant="h2" sx={{ textAlign: "center", mb: 4 }}>
              Log in
            </Typography>
            <Typography variant={"body1"} sx={{ mb: 4 }}>
              You need to sign in or sign up before continuing.
            </Typography>
            <LoginForm onLogin={handleLogin} />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
