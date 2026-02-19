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
  Chip,
  Alert
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import { useParams, useNavigate } from "react-router-dom";
import { supplierService, ledgerService, type LedgerEntry, type CreatePaymentRequest } from "../../services";
import { AddPaymentDialog } from "../../components/ledger/AddPaymentDialog";

export function SupplierLedgerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [supplier, setSupplier] = React.useState<{ name: string; dueAmount: number } | null>(null);
  const [entries, setEntries] = React.useState<LedgerEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = React.useState(false);

  // Load supplier and ledger entries
  const loadData = React.useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const supplierData = await supplierService.getSupplierById(id);
      if (!supplierData) {
        setError("Supplier not found");
        return;
      }

      setSupplier({ name: supplierData.name, dueAmount: supplierData.dueAmount });
      const ledgerEntries = await ledgerService.getSupplierLedger(id);
      setEntries(ledgerEntries);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load supplier ledger";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle add payment
  const handleAddPayment = async (data: CreatePaymentRequest) => {
    await ledgerService.addPayment(data);
    await loadData(); // Reload to refresh ledger entries
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading supplier ledger...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error || !supplier) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">{error || "Supplier not found"}</Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconButton onClick={() => navigate("/suppliers")} size="small">
                <ArrowBackIcon />
              </IconButton>
              <Box>
                <Typography variant="h6">Supplier Ledger: {supplier.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Current Due: ₹{supplier.dueAmount.toFixed(2)}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setPaymentDialogOpen(true)}
              color={supplier.dueAmount > 0 ? "error" : "primary"}
            >
              Add Payment
            </Button>
          </Box>
        </CardContent>
      </Card>

      {supplier.dueAmount > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This supplier has an outstanding due of ₹{supplier.dueAmount.toFixed(2)}
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Credit (Due)</TableCell>
              <TableCell align="right">Debit (Paid)</TableCell>
              <TableCell align="right">Balance</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No ledger entries yet. Create a purchase or add a payment to see entries here.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id} hover>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {entry.description}
                      <Chip
                        label={entry.type}
                        size="small"
                        color={entry.type === "payment" ? "success" : entry.type === "purchase" ? "primary" : "default"}
                        variant="outlined"
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {entry.credit > 0 && (
                      <Typography color="error" fontWeight="bold">
                        ₹{entry.credit.toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {entry.debit > 0 && (
                      <Typography color="success.main" fontWeight="bold">
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

      <AddPaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        onSubmit={handleAddPayment}
        type="supplier"
        partyId={id!}
        partyName={supplier.name}
      />
    </Box>
  );
}
