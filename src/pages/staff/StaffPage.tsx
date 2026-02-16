import { Box, Button, Card, CardContent, Typography } from "@mui/material";

export function StaffPage() {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">Staff</Typography>
          <Button variant="contained">Add Staff</Button>
        </Box>

        <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
          Placeholder page. Next: staff list table + create/edit dialog using /staff APIs.
        </Typography>
      </CardContent>
    </Card>
  );
}
