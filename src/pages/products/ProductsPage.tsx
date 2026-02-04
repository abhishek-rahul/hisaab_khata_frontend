import { Box, Button, Card, CardContent, Typography } from "@mui/material";

export function ProductsPage() {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6">Products</Typography>
          <Button variant="contained">Add Product</Button>
        </Box>

        <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
          Placeholder page. Next: table + filters + create/edit dialog using /product APIs.
        </Typography>
      </CardContent>
    </Card>
  );
}
