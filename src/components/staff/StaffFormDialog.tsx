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
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import type { CreateStaffRequest, UpdateStaffRequest, Staff } from "../../services";

interface StaffFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStaffRequest | UpdateStaffRequest) => Promise<void>;
  staff?: Staff | null; // null means create mode, Staff means edit mode
}

export function StaffFormDialog({ open, onClose, onSubmit, staff }: StaffFormDialogProps) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState<"owner" | "staff">("staff");
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Reset form when dialog opens/closes or staff changes
  React.useEffect(() => {
    if (open) {
      if (staff) {
        // Edit mode
        setName(staff.name);
        setEmail(staff.email || "");
        setPhone(staff.phone || "");
        setRole(staff.role);
      } else {
        // Create mode
        setName("");
        setEmail("");
        setPhone("");
        setRole("staff");
      }
      setError(null);
    }
  }, [open, staff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!name.trim()) {
        throw new Error("Staff name is required");
      }

      const data: CreateStaffRequest | UpdateStaffRequest = {
        name: name.trim(),
        role,
        ...(email.trim() && { email: email.trim() }),
        ...(phone.trim() && { phone: phone.trim() })
      };

      await onSubmit(data);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save staff";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{staff ? "Edit Staff Member" : "Add New Staff Member"}</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Staff Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
              autoFocus
            />

            <FormControl fullWidth required>
              <InputLabel>Role</InputLabel>
              <Select value={role} onChange={(e) => setRole(e.target.value as "owner" | "staff")} label="Role">
                <MenuItem value="owner">Owner</MenuItem>
                <MenuItem value="staff">Staff</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Email (Optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              type="email"
            />

            <TextField
              label="Phone (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
              type="tel"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? "Saving..." : staff ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
