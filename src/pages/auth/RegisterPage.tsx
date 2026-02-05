import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

export function RegisterPage() {
  const nav = useNavigate();
  const [shopName, setShopName] = React.useState("");
  const [ownerName, setOwnerName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Replace with real API register -> store token
    localStorage.setItem("hk_token", "demo-token");
    nav("/", { replace: true });
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Paper sx={{ width: "100%", maxWidth: 420, p: 3 }} elevation={3}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Register Shop
        </Typography>

        <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Shop Name"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Owner Name"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />

          <Button type="submit" variant="contained">
            Register
          </Button>

          <Typography variant="body2" color="text.secondary" align="center">
            Already have an account? <Link to="/login">Login</Link>
          </Typography>

          <Typography variant="body2" color="text.secondary">
            (Demo register: just stores a dummy token)
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
