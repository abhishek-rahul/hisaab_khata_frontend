import { Card, CardContent, Typography } from "@mui/material";

export function SalesPage() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Sales</Typography>
        <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
          Placeholder page. Next: sales list table with filters.
        </Typography>
      </CardContent>
    </Card>
  );
}
