import { Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export function NotFoundPage() {
  const nav = useNavigate();
  return (
    <div>
      <Typography variant="h5" sx={{ mb: 1 }}>
        404
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Page not found
      </Typography>
      <Button variant="contained" onClick={() => nav("/")}>
        Go Home
      </Button>
    </div>
  );
}
