import { Card, CardContent, Typography } from "@mui/material";

export function DashboardPage() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">Dashboard</Typography>
        <Typography variant="body2" color="text.secondary">
          Placeholder page. Next: show summary cards from /dashboard/summary.
        </Typography>
      </CardContent>
    </Card>
  );
}
