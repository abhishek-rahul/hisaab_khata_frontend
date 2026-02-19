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
  Button
} from "@mui/material";
import { ledgerService, type LedgerEntry, type LedgerFilter } from "../../services";

export function LedgerPage() {
  const [entries, setEntries] = React.useState<LedgerEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<LedgerFilter>({});
  const [partyType, setPartyType] = React.useState<"supplier" | "customer" | "all">("all");
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");

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

  const handleClearFilters = () => {
    setPartyType("all");
    setStartDate("");
    setEndDate("");
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
          <Typography variant="h6" sx={{ mb: 2 }}>
            Ledger (All Transactions)
          </Typography>

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
                        label={entry.type === "supplier" ? "Supplier" : "Customer"}
                        size="small"
                        color={entry.type === "supplier" ? "primary" : "secondary"}
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
                      <Typography color={entry.type === "supplier" ? "error" : "success.main"} fontWeight="bold">
                        ₹{entry.credit.toFixed(2)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {entry.debit > 0 && (
                      <Typography color={entry.type === "customer" ? "error" : "success.main"} fontWeight="bold">
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
    </Box>
  );
}
