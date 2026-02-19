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
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import { useNavigate } from "react-router-dom";
import {
  supplierService,
  type SupplierWithDue,
  type CreateSupplierRequest,
  type UpdateSupplierRequest
} from "../../services";
import { SupplierFormDialog } from "../../components/suppliers/SupplierFormDialog";

export function SuppliersPage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = React.useState<SupplierWithDue[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingSupplier, setEditingSupplier] = React.useState<SupplierWithDue | null>(null);

  // Load suppliers
  const loadSuppliers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierService.getSuppliers();
      setSuppliers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load suppliers";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  // Filter suppliers by search query
  const filteredSuppliers = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return suppliers;
    }
    const query = searchQuery.toLowerCase();
    return suppliers.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.phone?.toLowerCase().includes(query) ||
        s.email?.toLowerCase().includes(query) ||
        s.address?.toLowerCase().includes(query)
    );
  }, [suppliers, searchQuery]);

  // Handle create/edit
  const handleSubmit = async (data: CreateSupplierRequest | UpdateSupplierRequest) => {
    if (editingSupplier) {
      await supplierService.updateSupplier(editingSupplier.id, data as UpdateSupplierRequest);
    } else {
      await supplierService.createSupplier(data as CreateSupplierRequest);
    }
    await loadSuppliers();
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) {
      return;
    }
    try {
      await supplierService.deleteSupplier(id);
      await loadSuppliers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete supplier";
      alert(message);
    }
  };

  // Handle edit button
  const handleEdit = (supplier: SupplierWithDue) => {
    setEditingSupplier(supplier);
    setDialogOpen(true);
  };

  // Handle add button
  const handleAdd = () => {
    setEditingSupplier(null);
    setDialogOpen(true);
  };

  // Handle ledger button
  const handleLedger = (supplierId: string) => {
    navigate(`/suppliers/${supplierId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading suppliers...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">Suppliers</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
              Add Supplier
            </Button>
          </Box>

          <TextField
            fullWidth
            placeholder="Search suppliers by name, phone, email, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </CardContent>
      </Card>

      {error && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography color="error">{error}</Typography>
          </CardContent>
        </Card>
      )}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Due Amount</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery.trim() ? "No suppliers found matching your search." : "No suppliers yet. Add your first supplier!"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} hover>
                  <TableCell>{supplier.name}</TableCell>
                  <TableCell>{supplier.phone || "-"}</TableCell>
                  <TableCell>{supplier.email || "-"}</TableCell>
                  <TableCell>{supplier.address || "-"}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="body2"
                        color={supplier.dueAmount > 0 ? "error.main" : "text.secondary"}
                        fontWeight={supplier.dueAmount > 0 ? "bold" : "normal"}
                      >
                        ₹{supplier.dueAmount.toFixed(2)}
                      </Typography>
                      {supplier.dueAmount > 0 && (
                        <Chip label="Due" color="error" size="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleLedger(supplier.id)} color="primary" size="small" title="View Ledger">
                      <AccountBalanceIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleEdit(supplier)} color="primary" size="small" title="Edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(supplier.id)} color="error" size="small" title="Delete">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <SupplierFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingSupplier(null);
        }}
        onSubmit={handleSubmit}
        supplier={editingSupplier}
      />
    </Box>
  );
}
