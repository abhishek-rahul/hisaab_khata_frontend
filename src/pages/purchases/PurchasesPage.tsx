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
  purchaseService,
  supplierService,
  type PurchaseWithDetails,
  type SupplierWithDue
} from "../../services";

export function PurchasesPage() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = React.useState<PurchaseWithDetails[]>([]);
  const [suppliers, setSuppliers] = React.useState<SupplierWithDue[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [supplierFilter, setSupplierFilter] = React.useState<string>("all");

  // Load purchases and suppliers
  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [purchasesData, suppliersData] = await Promise.all([
        purchaseService.getPurchases(),
        supplierService.getSuppliers()
      ]);
      setPurchases(purchasesData);
      setSuppliers(suppliersData);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load purchases";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter purchases
  const filteredPurchases = React.useMemo(() => {
    let filtered = purchases;

    // Filter by supplier
    if (supplierFilter !== "all") {
      filtered = filtered.filter((p) => p.supplierId === supplierFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.supplierName.toLowerCase().includes(query) ||
          p.id.toLowerCase().includes(query) ||
          p.itemDetails.some((item) => item.productName.toLowerCase().includes(query))
      );
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [purchases, supplierFilter, searchQuery]);

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this purchase? This will also update stock and ledger.")) {
      return;
    }
    try {
      await purchaseService.deletePurchase(id);
      await loadData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete purchase";
      alert(message);
    }
  };

  // Handle view supplier ledger
  const handleViewSupplierLedger = (supplierId: string) => {
    navigate(`/suppliers/${supplierId}`);
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h6">Purchases</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/purchases/new")}>
              Create Purchase
            </Button>
          </Box>

          {/* Filters */}
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <TextField
              placeholder="Search by supplier, purchase ID, or product..."
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
              <InputLabel>Filter by Supplier</InputLabel>
              <Select
                value={supplierFilter}
                onChange={(e) => setSupplierFilter(e.target.value)}
                label="Filter by Supplier"
              >
                <MenuItem value="all">All Suppliers</MenuItem>
                {suppliers.map((supplier) => (
                  <MenuItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
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
              Loading purchases...
            </Typography>
          )}

          {/* Purchases Table */}
          {!loading && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Supplier</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell align="right">Total Amount</TableCell>
                    <TableCell align="right">Paid Amount</TableCell>
                    <TableCell align="right">Unpaid</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPurchases.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                          {searchQuery || supplierFilter !== "all"
                            ? "No purchases found matching your filters."
                            : "No purchases yet. Create your first purchase!"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPurchases.map((purchase) => {
                      const unpaid = purchase.totalAmount - purchase.paidAmount;
                      return (
                        <TableRow key={purchase.id} hover>
                          <TableCell>
                            {new Date(purchase.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="body2" fontWeight="medium">
                                {purchase.supplierName}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleViewSupplierLedger(purchase.supplierId)}
                                color="primary"
                                title="View Supplier Ledger"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                              {purchase.itemDetails.map((item, idx) => (
                                <Typography key={idx} variant="body2">
                                  {item.productName}: {item.quantity} {item.productUnit} @ ₹{item.price.toFixed(2)}
                                </Typography>
                              ))}
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium">
                              ₹{purchase.totalAmount.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" color="success.main">
                              ₹{purchase.paidAmount.toFixed(2)}
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
                              onClick={() => handleDelete(purchase.id)}
                              color="error"
                              title="Delete Purchase"
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
          {!loading && filteredPurchases.length > 0 && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Showing {filteredPurchases.length} of {purchases.length} purchase{purchases.length !== 1 ? "s" : ""}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                Total: ₹{filteredPurchases.reduce((sum, p) => sum + p.totalAmount, 0).toFixed(2)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
