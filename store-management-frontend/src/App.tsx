import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import MainLayout from "./components/MainLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProductsPage from "./pages/ProductsPage";
import OrdersPage from "./pages/OrdersPage";
import CustomersPage from "./pages/CustomersPage";
import CategoriesPage from "./pages/CategoriesPage";
import SuppliersPage from "./pages/SuppliersPage";
import PromotionsPage from "./pages/PromotionsPage";
import UsersPage from "./pages/UsersPage";

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
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
