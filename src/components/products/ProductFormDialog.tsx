import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography
} from "@mui/material";
import type { CreateProductRequest, UpdateProductRequest, ProductWithStock } from "../../services";

interface ProductFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProductRequest | UpdateProductRequest) => Promise<void>;
  product?: ProductWithStock | null; // null means create mode, ProductWithStock means edit mode
}

export function ProductFormDialog({ open, onClose, onSubmit, product }: ProductFormDialogProps) {
  const [name, setName] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [unit, setUnit] = React.useState("");
  const [purchasePrice, setPurchasePrice] = React.useState("");
  const [salePrice, setSalePrice] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Reset form when dialog opens/closes or product changes
  React.useEffect(() => {
    if (open) {
      if (product) {
        // Edit mode
        setName(product.name);
        setSku(product.sku || "");
        setUnit(product.unit);
        setPurchasePrice(product.purchasePrice.toString());
        setSalePrice(product.salePrice.toString());
      } else {
        // Create mode
        setName("");
        setSku("");
        setUnit("");
        setPurchasePrice("");
        setSalePrice("");
      }
      setError(null);
    }
  }, [open, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const purchasePriceNum = parseFloat(purchasePrice);
      const salePriceNum = parseFloat(salePrice);

      if (!name.trim()) {
        throw new Error("Product name is required");
      }
      if (!unit.trim()) {
        throw new Error("Unit is required");
      }
      if (isNaN(purchasePriceNum) || purchasePriceNum < 0) {
        throw new Error("Purchase price must be a valid number >= 0");
      }
      if (isNaN(salePriceNum) || salePriceNum < 0) {
        throw new Error("Sale price must be a valid number >= 0");
      }

      const data: CreateProductRequest | UpdateProductRequest = {
        name: name.trim(),
        unit: unit.trim(),
        purchasePrice: purchasePriceNum,
        salePrice: salePriceNum,
        ...(sku.trim() && { sku: sku.trim() })
      };

      await onSubmit(data);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save product";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="SKU (Optional)"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              fullWidth
              helperText="Stock Keeping Unit"
            />

            <TextField
              label="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
              fullWidth
              helperText="e.g., kg, pcs, liters"
              placeholder="kg"
            />

            <TextField
              label="Purchase Price"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              required
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              label="Sale Price"
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              required
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving..." : product ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
