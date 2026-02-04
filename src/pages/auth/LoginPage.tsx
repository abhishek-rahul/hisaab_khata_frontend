import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

export function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("owner@example.com");
  const [password, setPassword] = React.useState("password");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Replace with real API login -> store token
    localStorage.setItem("hk_token", "demo-token");
    nav("/", { replace: true });
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Paper sx={{ width: "100%", maxWidth: 420, p: 3 }} elevation={3}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Login
        </Typography>

        <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />

          <Button type="submit" variant="contained">
            Sign in
          </Button>

          <Typography variant="body2" color="text.secondary">
            (Demo login: just stores a dummy token)
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
