import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import type { CreatePaymentRequest } from "../../services";

interface AddPaymentDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentRequest) => Promise<void>;
  type: "supplier" | "customer";
  partyId: string;
  partyName: string;
}

export function AddPaymentDialog({ open, onClose, onSubmit, type, partyId, partyName }: AddPaymentDialogProps) {
  const [amount, setAmount] = React.useState("");
  const [date, setDate] = React.useState(new Date().toISOString().split("T")[0]);
  const [mode, setMode] = React.useState<"cash" | "online" | "cheque">("cash");
  const [reference, setReference] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setMode("cash");
      setReference("");
      setError(null);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const amountNum = parseFloat(amount);

      if (isNaN(amountNum) || amountNum <= 0) {
        throw new Error("Amount must be a valid number greater than 0");
      }
      if (!date) {
        throw new Error("Date is required");
      }

      const data: CreatePaymentRequest = {
        type,
        partyId,
        amount: amountNum,
        date: new Date(date).toISOString(),
        mode,
        ...(reference.trim() && { reference: reference.trim() })
      };

      await onSubmit(data);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to add payment";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          Add Payment - {partyName} ({type === "supplier" ? "Supplier" : "Customer"})
        </DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              fullWidth
              autoFocus
              inputProps={{ min: 0.01, step: 0.01 }}
            />

            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <FormControl fullWidth required>
              <InputLabel>Payment Mode</InputLabel>
              <Select value={mode} onChange={(e) => setMode(e.target.value as "cash" | "online" | "cheque")} label="Payment Mode">
                <MenuItem value="cash">Cash</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="cheque">Cheque</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Reference (Optional)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              fullWidth
              helperText="Transaction reference number"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Adding..." : "Add Payment"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
