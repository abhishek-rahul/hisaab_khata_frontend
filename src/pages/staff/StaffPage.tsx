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
import {
  staffService,
  type CreateStaffRequest,
  type UpdateStaffRequest,
  type Staff
} from "../../services";
import { StaffFormDialog } from "../../components/staff/StaffFormDialog";

export function StaffPage() {
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingStaff, setEditingStaff] = React.useState<Staff | null>(null);

  // Load staff
  const loadStaff = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await staffService.getStaff();
      setStaff(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load staff";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  // Filter staff by search query
  const filteredStaff = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return staff;
    }
    const query = searchQuery.toLowerCase();
    return staff.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.phone?.toLowerCase().includes(query) ||
        s.email?.toLowerCase().includes(query) ||
        s.role.toLowerCase().includes(query)
    );
  }, [staff, searchQuery]);

  // Handle create/edit
  const handleSubmit = async (data: CreateStaffRequest | UpdateStaffRequest) => {
    if (editingStaff) {
      await staffService.updateStaff(editingStaff.id, data as UpdateStaffRequest);
    } else {
      await staffService.createStaff(data as CreateStaffRequest);
    }
    await loadStaff();
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) {
      return;
    }
    try {
      await staffService.deleteStaff(id);
      await loadStaff();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete staff";
      alert(message);
    }
  };

  // Handle edit button
  const handleEdit = (staffMember: Staff) => {
    setEditingStaff(staffMember);
    setDialogOpen(true);
  };

  // Handle add button
  const handleAdd = () => {
    setEditingStaff(null);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography>Loading staff...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">Staff</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
              Add Staff
            </Button>
          </Box>

          <TextField
            fullWidth
            placeholder="Search staff by name, phone, email, or role..."
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
              <TableCell>Role</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery.trim() ? "No staff members found matching your search." : "No staff members yet. Add your first staff member!"}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((staffMember) => (
                <TableRow key={staffMember.id} hover>
                  <TableCell>{staffMember.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={staffMember.role === "owner" ? "Owner" : "Staff"}
                      color={staffMember.role === "owner" ? "primary" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{staffMember.email || "-"}</TableCell>
                  <TableCell>{staffMember.phone || "-"}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleEdit(staffMember)} color="primary" size="small" title="Edit">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(staffMember.id)} color="error" size="small" title="Delete">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <StaffFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingStaff(null);
        }}
        onSubmit={handleSubmit}
        staff={editingStaff}
      />
    </Box>
  );
}
