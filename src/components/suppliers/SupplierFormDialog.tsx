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
import type { CreateSupplierRequest, UpdateSupplierRequest, SupplierWithDue } from "../../services";

interface SupplierFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSupplierRequest | UpdateSupplierRequest) => Promise<void>;
  supplier?: SupplierWithDue | null; // null means create mode, SupplierWithDue means edit mode
}

export function SupplierFormDialog({ open, onClose, onSubmit, supplier }: SupplierFormDialogProps) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Reset form when dialog opens/closes or supplier changes
  React.useEffect(() => {
    if (open) {
      if (supplier) {
        // Edit mode
        setName(supplier.name);
        setPhone(supplier.phone || "");
        setEmail(supplier.email || "");
        setAddress(supplier.address || "");
      } else {
        // Create mode
        setName("");
        setPhone("");
        setEmail("");
        setAddress("");
      }
      setError(null);
    }
  }, [open, supplier]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!name.trim()) {
        throw new Error("Supplier name is required");
      }

      const data: CreateSupplierRequest | UpdateSupplierRequest = {
        name: name.trim(),
        ...(phone.trim() && { phone: phone.trim() }),
        ...(email.trim() && { email: email.trim() }),
        ...(address.trim() && { address: address.trim() })
      };

      await onSubmit(data);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save supplier";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{supplier ? "Edit Supplier" : "Add New Supplier"}</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Supplier Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              autoFocus
            />

            <TextField
              label="Phone (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              type="tel"
            />

            <TextField
              label="Email (Optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              type="email"
            />

            <TextField
              label="Address (Optional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving..." : supplier ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
