import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import InventoryIcon from "@mui/icons-material/Inventory";
import type { ProductWithStock } from "../../services";

interface ProductStockViewProps {
  product: ProductWithStock;
}

export function ProductStockView({ product }: ProductStockViewProps) {
  const isLowStock = product.stock < 10; // Consider stock < 10 as low stock
  const isOutOfStock = product.stock === 0;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <InventoryIcon fontSize="small" color={isOutOfStock ? "error" : isLowStock ? "warning" : "action"} />
      <Typography variant="body2" color={isOutOfStock ? "error" : isLowStock ? "warning.main" : "text.secondary"}>
        Stock: {product.stock} {product.unit}
      </Typography>
      {isOutOfStock && (
        <Chip label="Out of Stock" color="error" size="small" sx={{ ml: 1 }} />
      )}
      {isLowStock && !isOutOfStock && (
        <Chip label="Low Stock" color="warning" size="small" sx={{ ml: 1 }} />
      )}
    </Box>
  );
}
