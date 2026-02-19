import React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
  Divider
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import {
  purchaseService,
  supplierService,
  productService,
  type CreatePurchaseRequest,
  type PurchaseItem,
  type SupplierWithDue,
  type ProductWithStock
} from "../../services";

export function CreatePurchasePage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = React.useState<SupplierWithDue[]>([]);
  const [products, setProducts] = React.useState<ProductWithStock[]>([]);
  const [supplierId, setSupplierId] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = React.useState<Array<PurchaseItem & { id: string }>>([]);
  const [paidAmount, setPaidAmount] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load suppliers and products
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [suppliersData, productsData] = await Promise.all([
          supplierService.getSuppliers(),
          productService.getProducts()
        ]);
        setSuppliers(suppliersData);
        setProducts(productsData);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to load data";
        setError(message);
      }
    };
    loadData();
  }, []);

  // Calculate total amount
  const totalAmount = React.useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  }, [items]);

  // Add item
  const handleAddItem = () => {
    if (products.length === 0) {
      setError("No products available. Please add products first.");
      return;
    }
    setItems([
      ...items,
      {
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        productId: products[0].id,
        quantity: 1,
        price: products[0].purchasePrice
      }
    ]);
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  // Update item
  const handleUpdateItem = (itemId: string, field: keyof PurchaseItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          // If product changed, update price to product's purchase price
          if (field === "productId") {
            const product = products.find((p) => p.id === value);
            if (product) {
              updatedItem.price = product.purchasePrice;
            }
          }
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validation
      if (!supplierId.trim()) {
        throw new Error("Please select a supplier");
      }
      if (!date.trim()) {
        throw new Error("Please select a date");
      }
      if (items.length === 0) {
        throw new Error("Please add at least one item");
      }

      // Validate items
      for (const item of items) {
        if (!item.productId) {
          throw new Error("Please select a product for all items");
        }
        if (item.quantity <= 0) {
          throw new Error("Quantity must be greater than 0");
        }
        if (item.price < 0) {
          throw new Error("Price cannot be negative");
        }
      }

      // Validate paid amount
      const paidAmountNum = parseFloat(paidAmount) || 0;
      if (paidAmountNum < 0 || paidAmountNum > totalAmount) {
        throw new Error(`Paid amount must be between 0 and ${totalAmount.toFixed(2)}`);
      }

      const request: CreatePurchaseRequest = {
        supplierId,
        date: new Date(date).toISOString(),
        items: items.map(({ id, ...item }) => item),
        paidAmount: paidAmountNum
      };

      await purchaseService.createPurchase(request);
      navigate("/purchases");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create purchase";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
            <IconButton onClick={() => navigate("/purchases")} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">Create Purchase</Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Supplier Selection */}
              <FormControl fullWidth required>
                <InputLabel>Supplier</InputLabel>
                <Select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} label="Supplier">
                  <MenuItem value="">
                    <em>Select a supplier</em>
                  </MenuItem>
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                      {supplier.dueAmount > 0 && ` (Due: ₹${supplier.dueAmount.toFixed(2)})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Date */}
              <TextField
                label="Purchase Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                fullWidth
                InputLabelProps={{ shrink: true }}
              />

              {/* Items Section */}
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Items
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                    disabled={products.length === 0}
                  >
                    Add Item
                  </Button>
                </Box>

                {items.length === 0 ? (
                  <Alert severity="info">No items added. Click "Add Item" to add products.</Alert>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align="right">Quantity</TableCell>
                          <TableCell align="right">Price</TableCell>
                          <TableCell align="right">Total</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.map((item) => {
                          const product = products.find((p) => p.id === item.productId);
                          const itemTotal = item.quantity * item.price;
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <FormControl fullWidth size="small">
                                  <Select
                                    value={item.productId}
                                    onChange={(e) => handleUpdateItem(item.id, "productId", e.target.value)}
                                  >
                                    {products.map((p) => (
                                      <MenuItem key={p.id} value={p.id}>
                                        {p.name} ({p.unit}) - Stock: {p.stock}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </TableCell>
                              <TableCell align="right">
                                <TextField
                                  type="number"
                                  size="small"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleUpdateItem(item.id, "quantity", parseFloat(e.target.value) || 0)
                                  }
                                  inputProps={{ min: 0.01, step: 0.01 }}
                                  sx={{ width: 100 }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <TextField
                                  type="number"
                                  size="small"
                                  value={item.price}
                                  onChange={(e) =>
                                    handleUpdateItem(item.id, "price", parseFloat(e.target.value) || 0)
                                  }
                                  inputProps={{ min: 0, step: 0.01 }}
                                  sx={{ width: 120 }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight="medium">
                                  ₹{itemTotal.toFixed(2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveItem(item.id)}
                                  color="error"
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>

              <Divider />

              {/* Summary */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="h6">Total Amount:</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ₹{totalAmount.toFixed(2)}
                  </Typography>
                </Box>

                <TextField
                  label="Paid Amount"
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  fullWidth
                  inputProps={{ min: 0, max: totalAmount, step: 0.01 }}
                  helperText={`Unpaid: ₹${Math.max(0, totalAmount - (parseFloat(paidAmount) || 0)).toFixed(2)}`}
                />
              </Box>

              {/* Actions */}
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={() => navigate("/purchases")} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={loading || items.length === 0}>
                  {loading ? "Creating..." : "Create Purchase"}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
