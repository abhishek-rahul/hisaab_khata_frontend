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
  Chip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { productService, type ProductWithStock, type CreateProductRequest, type UpdateProductRequest } from "../../services";
import { ProductFormDialog } from "../../components/products/ProductFormDialog";
import { ProductStockView } from "../../components/products/ProductStockView";

export function ProductsPage() {
  const [products, setProducts] = React.useState<ProductWithStock[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<ProductWithStock | null>(null);

  // Load products
  const loadProducts = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load products";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Auto-refresh when page becomes visible (e.g., after returning from purchase/sale pages)
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadProducts();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [loadProducts]);

  // Auto-refresh on window focus (when user switches back to tab)
  React.useEffect(() => {
    const handleFocus = () => {
      loadProducts();
    };

    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [loadProducts]);

  // Filter products by search query
  const filteredProducts = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.unit.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Handle create/edit
  const handleSubmit = async (data: CreateProductRequest | UpdateProductRequest) => {
    if (editingProduct) {
      await productService.updateProduct(editingProduct.id, data as UpdateProductRequest);
    } else {
      await productService.createProduct(data as CreateProductRequest);
    }
    await loadProducts();
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      await productService.deleteProduct(id);
      await loadProducts();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete product";
      alert(message);
    }
  };

  // Handle edit button
  const handleEdit = (product: ProductWithStock) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  // Handle add button
  const handleAdd = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingProduct(null);
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Typography variant="h6">Products</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
              Add Product
            </Button>
          </Box>

          {/* Search */}
          <TextField
            fullWidth
            placeholder="Search products by name, SKU, or unit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />

          {/* Error */}
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {/* Loading */}
          {loading && (
            <Typography variant="body2" color="text.secondary">
              Loading products...
            </Typography>
          )}

          {/* Products Table */}
          {!loading && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Purchase Price</TableCell>
                    <TableCell>Sale Price</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                          {searchQuery ? "No products found matching your search." : "No products yet. Add your first product!"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {product.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {product.sku ? (
                            <Chip label={product.sku} size="small" variant="outlined" />
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{product.unit}</TableCell>
                        <TableCell>₹{product.purchasePrice.toFixed(2)}</TableCell>
                        <TableCell>₹{product.salePrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <ProductStockView product={product} />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleEdit(product)} color="primary">
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(product.id)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Summary */}
          {!loading && filteredProducts.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Showing {filteredProducts.length} of {products.length} product{products.length !== 1 ? "s" : ""}
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <ProductFormDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleSubmit}
        product={editingProduct}
      />
    </Box>
  );
}
