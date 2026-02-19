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
  saleService,
  customerService,
  productService,
  type CreateSaleRequest,
  type SaleItem,
  type CustomerWithDue,
  type ProductWithStock
} from "../../services";

export function CreateSalePage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = React.useState<CustomerWithDue[]>([]);
  const [products, setProducts] = React.useState<ProductWithStock[]>([]);
  const [customerId, setCustomerId] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [items, setItems] = React.useState<Array<SaleItem & { id: string }>>([]);
  const [receivedAmount, setReceivedAmount] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load customers and products
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [customersData, productsData] = await Promise.all([
          customerService.getCustomers(),
          productService.getProducts()
        ]);
        setCustomers(customersData);
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
        price: products[0].salePrice
      }
    ]);
  };

  // Remove item
  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  // Update item
  const handleUpdateItem = (itemId: string, field: keyof SaleItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };
          // If product changed, update price to product's sale price
          if (field === "productId") {
            const product = products.find((p) => p.id === value);
            if (product) {
              updatedItem.price = product.salePrice;
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
      if (!customerId.trim()) {
        throw new Error("Please select a customer");
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

        // Check stock availability
        const product = products.find((p) => p.id === item.productId);
        if (product && product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock} ${product.unit}, Requested: ${item.quantity} ${product.unit}`);
        }
      }

      // Validate received amount
      const receivedAmountNum = parseFloat(receivedAmount) || 0;
      if (receivedAmountNum < 0 || receivedAmountNum > totalAmount) {
        throw new Error(`Received amount must be between 0 and ${totalAmount.toFixed(2)}`);
      }

      const request: CreateSaleRequest = {
        customerId,
        date: new Date(date).toISOString(),
        items: items.map(({ id, ...item }) => item),
        receivedAmount: receivedAmountNum
      };

      await saleService.createSale(request);
      navigate("/sales");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create sale";
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
            <IconButton onClick={() => navigate("/sales")} size="small">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6">Create Sale</Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Customer Selection */}
              <FormControl fullWidth required>
                <InputLabel>Customer</InputLabel>
                <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} label="Customer">
                  <MenuItem value="">
                    <em>Select a customer</em>
                  </MenuItem>
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                      {customer.dueAmount > 0 && ` (Due: ₹${customer.dueAmount.toFixed(2)})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Date */}
              <TextField
                label="Sale Date"
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
                          const stockAvailable = product?.stock || 0;
                          const isStockInsufficient = stockAvailable < item.quantity;
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
                                {isStockInsufficient && (
                                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
                                    Insufficient stock! Available: {stockAvailable} {product?.unit}
                                  </Typography>
                                )}
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
                                  error={isStockInsufficient}
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
                  label="Received Amount"
                  type="number"
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  fullWidth
                  inputProps={{ min: 0, max: totalAmount, step: 0.01 }}
                  helperText={`Unpaid: ₹${Math.max(0, totalAmount - (parseFloat(receivedAmount) || 0)).toFixed(2)}`}
                />
              </Box>

              {/* Actions */}
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={() => navigate("/sales")} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={loading || items.length === 0}>
                  {loading ? "Creating..." : "Create Sale"}
                </Button>
              </Box>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
