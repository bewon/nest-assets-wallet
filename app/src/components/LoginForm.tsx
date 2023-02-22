import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import { useTranslation } from "next-i18next";

type LoginFormProps = {
  onLogin: (email: string, password: string) => void;
};

export default function LoginForm({ onLogin: handleLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useTranslation();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleLogin(email, password);
  };
  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label={t("auth.user.email")}
        value={email}
        type="email"
        onChange={(event) => setEmail(event.target.value)}
        fullWidth
        required
        autoFocus
        sx={{ mb: 3 }}
      />
      <TextField
        label={t("auth.user.password")}
        value={password}
        type="password"
        onChange={(event) => setPassword(event.target.value)}
        fullWidth
        required
        sx={{ mb: 3 }}
      />
      <Button type="submit" variant="contained" color="secondary" fullWidth>
        {t("auth.logIn")}
      </Button>
    </form>
  );
}
