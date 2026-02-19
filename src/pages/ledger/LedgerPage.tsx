import React from "react";
import {
  Box,
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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { ledgerService, supplierService, customerService, type LedgerEntry, type LedgerFilter, type CreatePaymentRequest, type SupplierWithDue, type CustomerWithDue } from "../../services";
import { AddPaymentDialog } from "../../components/ledger/AddPaymentDialog";

export function LedgerPage() {
  const [entries, setEntries] = React.useState<LedgerEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<LedgerFilter>({});
  const [partyType, setPartyType] = React.useState<"supplier" | "customer" | "all">("all");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  
  // Add Payment states
  const [selectPartyDialogOpen, setSelectPartyDialogOpen] = React.useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = React.useState<"supplier" | "customer">("supplier");
  const [selectedPartyId, setSelectedPartyId] = React.useState<string>("");
  const [selectedPartyName, setSelectedPartyName] = React.useState<string>("");
  const [suppliers, setSuppliers] = React.useState<SupplierWithDue[]>([]);
  const [customers, setCustomers] = React.useState<CustomerWithDue[]>([]);

  // Load ledger entries
  const loadEntries = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filterData: LedgerFilter = {};
      if (partyType !== "all") {
        filterData.type = partyType;
      }
      if (startDate) {
        filterData.startDate = new Date(startDate).toISOString();
      }
      if (endDate) {
        filterData.endDate = new Date(endDate).toISOString();
      }

      const data = await ledgerService.getLedgerEntries(filterData);
      setEntries(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load ledger entries";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [partyType, startDate, endDate]);

  React.useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Load suppliers and customers for payment selection
  React.useEffect(() => {
    const loadParties = async () => {
      try {
        const [suppliersData, customersData] = await Promise.all([
          supplierService.getSuppliers(),
          customerService.getCustomers()
        ]);
        setSuppliers(suppliersData);
        setCustomers(customersData);
      } catch (err) {
        console.error("Failed to load parties:", err);
      }
    };
    loadParties();
  }, []);

  const handleClearFilters = () => {
    setPartyType("all");
    setStartDate("");
    setEndDate("");
  };

  const handleAddPaymentClick = () => {
    setSelectPartyDialogOpen(true);
  };

  const handleSelectParty = () => {
    if (!selectedPartyId) {
      return;
    }
    setSelectPartyDialogOpen(false);
    setPaymentDialogOpen(true);
  };

  const handleAddPayment = async (data: CreatePaymentRequest) => {
    await ledgerService.addPayment(data);
    await loadEntries(); // Reload to refresh ledger entries
    setPaymentDialogOpen(false);
    setSelectedPartyId("");
    setSelectedPartyName("");
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading ledger entries...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">
              Ledger (All Transactions)
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddPaymentClick}
            >
              Add Payment
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "flex-end" }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Party Type</InputLabel>
              <Select
                value={partyType}
                onChange={(e) => setPartyType(e.target.value as "supplier" | "customer" | "all")}
                label="Party Type"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="supplier">Suppliers</MenuItem>
                <MenuItem value="customer">Customers</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />

            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />

            <Button variant="outlined" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Box>
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
              <TableCell>Date</TableCell>
              <TableCell>Party</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Credit</TableCell>
              <TableCell align="right">Debit</TableCell>
              <TableCell align="right">Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No ledger entries found. {partyType !== "all" || startDate || endDate ? "Try adjusting your filters." : "Create purchases, sales, or payments to see entries here."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id} hover>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {entry.partyName}
                      </Typography>
                      <Chip
                        label={entry.partyType === "supplier" ? "Supplier" : "Customer"}
                        size="small"
                        color={entry.partyType === "supplier" ? "primary" : "secondary"}
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {entry.description}
                      <Chip
                        label={entry.type}
                        size="small"
                        color={
                          entry.type === "payment"
                            ? "success"
                            : entry.type === "purchase"
                            ? "primary"
                            : entry.type === "sale"
                            ? "secondary"
                            : "default"
                        }
                        variant="outlined"
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {entry.credit > 0 && (
                      <Typography color={entry.partyType === "supplier" ? "error" : "success.main"} fontWeight="bold">
                        ₹{entry.credit.toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {entry.debit > 0 && (
                      <Typography color={entry.partyType === "customer" ? "error" : "success.main"} fontWeight="bold">
                        ₹{entry.debit.toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="bold" color={entry.balance > 0 ? "error.main" : "text.secondary"}>
                      ₹{entry.balance.toFixed(2)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Select Party Dialog */}
      <Dialog open={selectPartyDialogOpen} onClose={() => setSelectPartyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Party for Payment</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Party Type</InputLabel>
              <Select
                value={selectedPaymentType}
                onChange={(e) => {
                  setSelectedPaymentType(e.target.value as "supplier" | "customer");
                  setSelectedPartyId("");
                  setSelectedPartyName("");
                }}
                label="Party Type"
              >
                <MenuItem value="supplier">Supplier</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Select {selectedPaymentType === "supplier" ? "Supplier" : "Customer"}</InputLabel>
              <Select
                value={selectedPartyId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedPartyId(id);
                  if (selectedPaymentType === "supplier") {
                    const supplier = suppliers.find((s) => s.id === id);
                    setSelectedPartyName(supplier?.name || "");
                  } else {
                    const customer = customers.find((c) => c.id === id);
                    setSelectedPartyName(customer?.name || "");
                  }
                }}
                label={`Select ${selectedPaymentType === "supplier" ? "Supplier" : "Customer"}`}
              >
                {(selectedPaymentType === "supplier" ? suppliers : customers).map((party) => (
                  <MenuItem key={party.id} value={party.id}>
                    {party.name} {party.dueAmount > 0 && `(Due: ₹${party.dueAmount.toFixed(2)})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectPartyDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSelectParty}
            disabled={!selectedPartyId}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Payment Dialog */}
      {selectedPartyId && selectedPartyName && (
        <AddPaymentDialog
          open={paymentDialogOpen}
          onClose={() => {
            setPaymentDialogOpen(false);
            setSelectedPartyId("");
            setSelectedPartyName("");
          }}
          onSubmit={handleAddPayment}
          type={selectedPaymentType}
          partyId={selectedPartyId}
          partyName={selectedPartyName}
        />
      )}
    </Box>
  );
}
