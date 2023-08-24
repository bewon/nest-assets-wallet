import React, { useState } from "react";
import { Button, TextField } from "@mui/material";
import { useTranslation } from "next-i18next";

type LoginFormProps = {
  onLogin: (email: string, password: string) => Promise<void>;
};

export default function LoginForm({ onLogin: handleLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useTranslation();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    await handleLogin(email, password);
    setIsSubmitting(false);
  };
  return (
    <form onSubmit={handleSubmit}>
      <TextField
        id="email"
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
        id="password"
        label={t("auth.user.password")}
        value={password}
        type="password"
        onChange={(event) => setPassword(event.target.value)}
        fullWidth
        required
        sx={{ mb: 3 }}
      />
      <SubmitButton isSubmitting={isSubmitting} />
    </form>
  );
}

function SubmitButton(props: { isSubmitting: boolean }) {
  const { t } = useTranslation();
  return (
    <Button
      type="submit"
      variant="contained"
      color="secondary"
      fullWidth
      disabled={props.isSubmitting}
    >
      {props.isSubmitting ? t("auth.loggingIn") : t("auth.logIn")}
    </Button>
  );
}
