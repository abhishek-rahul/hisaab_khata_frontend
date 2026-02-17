import { Box, Button, Link, Paper, TextField, Typography } from "@mui/material";
import React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { authService } from "../../services";

const ERROR_MESSAGES: Record<string, string> = {
  ALL_FIELDS_REQUIRED: "Please fill in all fields.",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters.",
  USER_EMAIL_EXISTS: "An account with this email already exists."
};

export function RegisterPage() {
  const nav = useNavigate();
  const [shopName, setShopName] = React.useState("");
  const [ownerName, setOwnerName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.register({
        shopName,
        ownerName,
        email,
        password
      });
      nav("/", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "REGISTRATION_FAILED";
      setError(ERROR_MESSAGES[message] ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", p: 2 }}>
      <Paper sx={{ width: "100%", maxWidth: 420, p: 3 }} elevation={3}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Register your shop
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Create your tenant and owner account to get started.
        </Typography>

        <Box component="form" onSubmit={onSubmit} sx={{ display: "grid", gap: 2 }}>
          <TextField
            label="Shop name"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Your name"
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
            helperText="At least 6 characters"
          />

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Creating…" : "Register"}
          </Button>

          <Typography variant="body2" color="text.secondary">
            Already have an account?{" "}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
