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
  customerService,
  type CustomerWithDue,
  type CreateCustomerRequest,
  type UpdateCustomerRequest
} from "../../services";
import { CustomerFormDialog } from "../../components/customers/CustomerFormDialog";

export function CustomersPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = React.useState<CustomerWithDue[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<CustomerWithDue | null>(null);

  // Load customers
  const loadCustomers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customerService.getCustomers();
      setCustomers(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load customers";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Filter customers by search query
  const filteredCustomers = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return customers;
    }
    const query = searchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.phone?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.address?.toLowerCase().includes(query)
    );
  }, [customers, searchQuery]);

  // Handle create/edit
  const handleSubmit = async (data: CreateCustomerRequest | UpdateCustomerRequest) => {
    if (editingCustomer) {
      await customerService.updateCustomer(editingCustomer.id, data as UpdateCustomerRequest);
    } else {
      await customerService.createCustomer(data as CreateCustomerRequest);
    }
    await loadCustomers();
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }
    try {
      await customerService.deleteCustomer(id);
      await loadCustomers();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete customer";
      alert(message);
    }
  };

  // Handle edit button
  const handleEdit = (customer: CustomerWithDue) => {
    setEditingCustomer(customer);
    setDialogOpen(true);
  };

  // Handle add button
  const handleAdd = () => {
    setEditingCustomer(null);
    setDialogOpen(true);
  };

  // Handle ledger button
  const handleLedger = (customerId: string) => {
    navigate(`/customers/${customerId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading customers...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">Customers</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
              Add Customer
            </Button>
          </Box>

          <TextField
            fullWidth
            placeholder="Search customers by name, phone, email, or address..."
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
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery.trim() ? "No customers found matching your search." : "No customers yet. Add your first customer!"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} hover>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.phone || "-"}</TableCell>
                  <TableCell>{customer.email || "-"}</TableCell>
                  <TableCell>{customer.address || "-"}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="body2"
                        color={customer.dueAmount > 0 ? "error.main" : "text.secondary"}
                        fontWeight={customer.dueAmount > 0 ? "bold" : "normal"}
                      >
                        ₹{customer.dueAmount.toFixed(2)}
                      </Typography>
                      {customer.dueAmount > 0 && (
                        <Chip label="Due" color="error" size="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleLedger(customer.id)} color="primary" size="small" title="View Ledger">
                      <AccountBalanceIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleEdit(customer)} color="primary" size="small" title="Edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(customer.id)} color="error" size="small" title="Delete">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CustomerFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingCustomer(null);
        }}
        onSubmit={handleSubmit}
        customer={editingCustomer}
      />
    </Box>
  );
}
