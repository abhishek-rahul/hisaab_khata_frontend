import { Route, Routes, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { AppLayout } from "./layouts/AppLayout";
import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { ProductsPage } from "./pages/products/ProductsPage";
import { SuppliersPage } from "./pages/suppliers/SuppliersPage";
import { SupplierLedgerPage } from "./pages/suppliers/SupplierLedgerPage";
import { CustomersPage } from "./pages/customers/CustomersPage";
import { CustomerLedgerPage } from "./pages/customers/CustomerLedgerPage";
import { LedgerPage } from "./pages/ledger/LedgerPage";
import { CreatePurchasePage } from "./pages/purchases/CreatePurchasePage";
import { PurchasesPage } from "./pages/purchases/PurchasesPage";
import { CreateSalePage } from "./pages/sales/CreateSalePage";
import { SalesPage } from "./pages/sales/SalesPage";
import { StaffPage } from "./pages/staff/StaffPage";
import { NotFoundPage } from "./pages/NotFoundPage";

// TODO: Replace with real auth state (token)
const isAuthenticated = () => Boolean(localStorage.getItem("hk_token"));

function RequireAuth({ children }: { children: JSX.Element }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="suppliers" element={<SuppliersPage />} />
        <Route path="suppliers/:id" element={<SupplierLedgerPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:id" element={<CustomerLedgerPage />} />
        <Route path="ledger" element={<LedgerPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="purchases/new" element={<CreatePurchasePage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="sales/new" element={<CreateSalePage />} />
        <Route path="staff" element={<StaffPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
