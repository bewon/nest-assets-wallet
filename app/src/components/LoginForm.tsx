import React, { useState } from "react";
import { Button, TextField } from "@mui/material";

type LoginFormProps = {
  onLogin: (email: string, password: string) => void;
};

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onLogin(email, password);
  };
  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Email"
        value={email}
        type="email"
        onChange={(event) => setEmail(event.target.value)}
        fullWidth
        required
        autoFocus
        sx={{ mb: 3 }}
      />
      <TextField
        label="Password"
        value={password}
        type="password"
        onChange={(event) => setPassword(event.target.value)}
        fullWidth
        required
        sx={{ mb: 3 }}
      />
      <Button type="submit" variant="contained" color="secondary" fullWidth>
        Log in
      </Button>
    </form>
  );
}
