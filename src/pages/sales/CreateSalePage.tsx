import { Card, CardContent, Typography } from "@mui/material";

export function CreateSalePage() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Create Sale</Typography>
        <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
          Placeholder page. Next: sale form with customer selection + product items.
        </Typography>
      </CardContent>
    </Card>
  );
}
