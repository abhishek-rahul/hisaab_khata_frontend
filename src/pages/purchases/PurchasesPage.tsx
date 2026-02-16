import { Card, CardContent, Typography } from "@mui/material";

export function PurchasesPage() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Purchases</Typography>
        <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
          Placeholder page. Next: purchases list table with filters.
        </Typography>
      </CardContent>
    </Card>
  );
}
