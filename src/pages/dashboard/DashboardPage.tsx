import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  Paper,
  Divider
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import InventoryIcon from "@mui/icons-material/Inventory";
import WarningIcon from "@mui/icons-material/Warning";
import { dashboardService, type DashboardMetrics } from "../../services";
import { useNavigate } from "react-router-dom";

export function DashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = React.useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Load dashboard metrics
  const loadMetrics = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load dashboard metrics";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading dashboard...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error}</Alert>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Today Sales Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-4px)",
                transition: "transform 0.2s"
              }
            }}
            onClick={() => navigate("/sales")}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
                  Today Sales
                </Typography>
                <TrendingUpIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                ₹{metrics.todaySales.toFixed(2)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total sales for today
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Due Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "white",
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-4px)",
                transition: "transform 0.2s"
              }
            }}
            onClick={() => navigate("/ledger")}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
                  Total Due
                </Typography>
                <AccountBalanceIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                ₹{metrics.totalDue.toFixed(2)}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Customer Due: ₹{metrics.customerDue.toFixed(2)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Supplier Due: ₹{metrics.supplierDue.toFixed(2)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Alerts Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: "100%",
              background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
              color: "white",
              cursor: "pointer",
              "&:hover": {
                transform: "translateY(-4px)",
                transition: "transform 0.2s"
              }
            }}
            onClick={() => navigate("/products")}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" sx={{ color: "white", fontWeight: "bold" }}>
                  Low Stock Alerts
                </Typography>
                <WarningIcon sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                {metrics.lowStockProducts.length}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Products with stock &lt; 10
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Low Stock Products List */}
        {metrics.lowStockProducts.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <InventoryIcon color="warning" />
                  <Typography variant="h6" fontWeight="bold">
                    Low Stock Products
                  </Typography>
                  <Chip label={metrics.lowStockProducts.length} color="warning" size="small" />
                </Box>
                <Divider sx={{ mb: 2 }} />
                <Paper variant="outlined">
                  <List>
                    {metrics.lowStockProducts.map((product, index) => (
                      <React.Fragment key={product.id}>
                        <ListItem
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "action.hover"
                            }
                          }}
                          onClick={() => navigate("/products")}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography variant="body1" fontWeight="medium">
                                  {product.name}
                                </Typography>
                                {product.sku && (
                                  <Chip label={product.sku} size="small" variant="outlined" />
                                )}
                              </Box>
                            }
                            secondary={
                              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 0.5 }}>
                                <Typography variant="body2" color="text.secondary">
                                  Stock: {product.stock} {product.unit}
                                </Typography>
                                {product.stock === 0 && (
                                  <Chip label="Out of Stock" color="error" size="small" />
                                )}
                                {product.stock > 0 && product.stock < 10 && (
                                  <Chip label="Low Stock" color="warning" size="small" />
                                )}
                              </Box>
                            }
                          />
                        </ListItem>
                        {index < metrics.lowStockProducts.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Empty State for Low Stock */}
        {metrics.lowStockProducts.length === 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <InventoryIcon color="success" />
                  <Typography variant="h6" fontWeight="bold">
                    Stock Status
                  </Typography>
                </Box>
                <Alert severity="success">All products have sufficient stock!</Alert>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
