import { Card, CardContent, Typography } from "@mui/material";

export function CreatePurchasePage() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Create Purchase</Typography>
        <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
          Placeholder page. Next: purchase form with supplier selection + product items.
        </Typography>
      </CardContent>
    </Card>
  );
}
