import { Box, Button, Card, CardContent, Typography } from "@mui/material";

export function CustomersPage() {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">Customers</Typography>
          <Button variant="contained">Add Customer</Button>
        </Box>

        <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
          Placeholder page. Next: table + filters + create/edit dialog using /customer APIs.
        </Typography>
      </CardContent>
    </Card>
  );
}
