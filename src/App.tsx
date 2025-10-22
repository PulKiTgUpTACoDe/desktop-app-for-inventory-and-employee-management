// ...existing code...
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Suppliers from "./pages/Suppliers";
import Vendors from "./pages/Vendors";
import PurchaseOrders from "./pages/PurchaseOrders";
import SalesOrders from "./pages/SalesOrders";
import Employees from "./pages/Employees";
import Payrolls from "./pages/Payrolls";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import { AuthProvider, useAuth } from "./auth.tsx";


function App() {
  const { isLoggedIn, login } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {!isLoggedIn ? (
          <Route path="/*" element={<Login onLogin={login} />} />
        ) : (
          <Route path="/" element={<MainLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="suppliers" element={<Suppliers />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="purchaseorders" element={<PurchaseOrders />} />
            <Route path="salesorders" element={<SalesOrders />} />
            <Route path="employees" element={<Employees />} />
            <Route path="payrolls" element={<Payrolls />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="payments" element={<Payments />} />
            <Route path="settings" element={<Settings />} />
            <Route path="" element={<Navigate to="dashboard" />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}

const AppWithProvider = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWithProvider;
