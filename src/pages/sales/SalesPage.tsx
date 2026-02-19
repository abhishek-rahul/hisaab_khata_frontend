import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import {
  saleService,
  customerService,
  type SaleWithDetails,
  type CustomerWithDue
} from "../../services";

export function SalesPage() {
  const navigate = useNavigate();
  const [sales, setSales] = React.useState<SaleWithDetails[]>([]);
  const [customers, setCustomers] = React.useState<CustomerWithDue[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [customerFilter, setCustomerFilter] = React.useState<string>("all");

  // Load sales and customers
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [salesData, customersData] = await Promise.all([
        saleService.getSales(),
        customerService.getCustomers()
      ]);
      setSales(salesData);
      setCustomers(customersData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load sales";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter sales
  const filteredSales = React.useMemo(() => {
    let filtered = sales;

    // Filter by customer
    if (customerFilter !== "all") {
      filtered = filtered.filter((s) => s.customerId === customerFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.customerName.toLowerCase().includes(query) ||
          s.id.toLowerCase().includes(query) ||
          s.itemDetails.some((item) => item.productName.toLowerCase().includes(query))
      );
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, customerFilter, searchQuery]);

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this sale? This will also update stock and ledger.")) {
      return;
    }
    try {
      await saleService.deleteSale(id);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete sale";
      alert(message);
    }
  };

  // Handle view customer ledger
  const handleViewCustomerLedger = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h6">Sales</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/sales/new")}>
              Create Sale
            </Button>
          </Box>

          {/* Filters */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              placeholder="Search by customer, sale ID, or product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Customer</InputLabel>
              <Select
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                label="Filter by Customer"
              >
                <MenuItem value="all">All Customers</MenuItem>
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Error */}
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {/* Loading */}
          {loading && (
            <Typography variant="body2" color="text.secondary">
              Loading sales...
            </Typography>
          )}

          {/* Sales Table */}
          {!loading && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell align="right">Total Amount</TableCell>
                    <TableCell align="right">Received Amount</TableCell>
                    <TableCell align="right">Unpaid</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSales.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                          {searchQuery || customerFilter !== "all"
                            ? "No sales found matching your filters."
                            : "No sales yet. Create your first sale!"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSales.map((sale) => {
                      const unpaid = sale.totalAmount - sale.receivedAmount;
                      return (
                        <TableRow key={sale.id} hover>
                          <TableCell>
                            {new Date(sale.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="body2" fontWeight="medium">
                                {sale.customerName}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleViewCustomerLedger(sale.customerId)}
                                color="primary"
                                title="View Customer Ledger"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                              {sale.itemDetails.map((item, idx) => (
                                <Typography key={idx} variant="body2">
                                  {item.productName}: {item.quantity} {item.productUnit} @ ₹{item.price.toFixed(2)}
                                </Typography>
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              ₹{sale.totalAmount.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="success.main">
                              ₹{sale.receivedAmount.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {unpaid > 0 ? (
                              <Chip
                                label={`₹${unpaid.toFixed(2)}`}
                                color="error"
                                size="small"
                                variant="outlined"
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                ₹0.00
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(sale.id)}
                              color="error"
                              title="Delete Sale"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Summary */}
          {!loading && filteredSales.length > 0 && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredSales.length} of {sales.length} sale{sales.length !== 1 ? "s" : ""}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                Total: ₹{filteredSales.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
