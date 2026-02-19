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
import type { CreateCustomerRequest, UpdateCustomerRequest, CustomerWithDue } from "../../services";

interface CustomerFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerRequest | UpdateCustomerRequest) => Promise<void>;
  customer?: CustomerWithDue | null; // null means create mode, CustomerWithDue means edit mode
}

export function CustomerFormDialog({ open, onClose, onSubmit, customer }: CustomerFormDialogProps) {
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Reset form when dialog opens/closes or customer changes
  React.useEffect(() => {
    if (open) {
      if (customer) {
        // Edit mode
        setName(customer.name);
        setPhone(customer.phone || "");
        setEmail(customer.email || "");
        setAddress(customer.address || "");
      } else {
        // Create mode
        setName("");
        setPhone("");
        setEmail("");
        setAddress("");
      }
      setError(null);
    }
  }, [open, customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!name.trim()) {
        throw new Error("Customer name is required");
      }

      const data: CreateCustomerRequest | UpdateCustomerRequest = {
        name: name.trim(),
        ...(phone.trim() && { phone: phone.trim() }),
        ...(email.trim() && { email: email.trim() }),
        ...(address.trim() && { address: address.trim() })
      };

      await onSubmit(data);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save customer";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{customer ? "Edit Customer" : "Add New Customer"}</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Customer Name"
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
            {loading ? "Saving..." : customer ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
