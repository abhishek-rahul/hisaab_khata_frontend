import { Card, CardContent, Typography } from "@mui/material";

export function LedgerPage() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Ledger</Typography>
        <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
          Placeholder page. Next: generic ledger view with credit/debit entries + filters.
        </Typography>
      </CardContent>
    </Card>
  );
}
