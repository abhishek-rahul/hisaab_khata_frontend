import { Card, CardContent, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

export function SupplierLedgerPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Supplier Ledger</Typography>
        <Typography variant="body2" color="text.secondary">
          Supplier ID: {id}
        </Typography>
        <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
          Placeholder page. Next: ledger entries table + add payment dialog.
        </Typography>
      </CardContent>
    </Card>
  );
}
