import { Box, Button, Link, Paper, TextField, Typography } from "@mui/material";
import React from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { authService } from "../../services";

const ERROR_MESSAGES: Record<string, string> = {
  EMAIL_AND_PASSWORD_REQUIRED: "Please enter email and password.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  TENANT_NOT_FOUND: "Account configuration error. Please contact support."
};

export function LoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("owner@example.com");
  const [password, setPassword] = React.useState("password");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authService.login({ email, password });
      nav("/", { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "LOGIN_FAILED";
      setError(ERROR_MESSAGES[message] ?? "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
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

          {error && (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          )}

          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>

          <Typography variant="body2" color="text.secondary">
            Don&apos;t have an account?{" "}
            <Link component={RouterLink} to="/register">
              Register your shop
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
