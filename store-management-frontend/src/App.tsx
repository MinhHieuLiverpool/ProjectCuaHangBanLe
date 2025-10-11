import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import MainLayout from "./components/MainLayout";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import CategoriesPage from "./pages/CategoriesPage";
import CustomersPage from "./pages/CustomersPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";
import PromotionsPage from "./pages/PromotionsPage";
import StockReceiptsPage from "./pages/StockReceiptsPage";
import SuppliersPage from "./pages/SuppliersPage";
import UsersPage from "./pages/UsersPage";
import WarehousesPage from "./pages/WarehousesPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route
              path="categories"
              element={
                <PrivateRoute requireAdmin>
                  <CategoriesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="suppliers"
              element={
                <PrivateRoute requireAdmin>
                  <SuppliersPage />
                </PrivateRoute>
              }
            />
            <Route
              path="warehouses"
              element={
                <PrivateRoute requireAdmin>
                  <WarehousesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="promotions"
              element={
                <PrivateRoute requireAdmin>
                  <PromotionsPage />
                </PrivateRoute>
              }
            />
            <Route
              path="users"
              element={
                <PrivateRoute requireAdmin>
                  <UsersPage />
                </PrivateRoute>
              }
            />

            <Route path="stock-receipts" element={<StockReceiptsPage />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
