import apiClient from "./api";

// Dashboard Statistics Types
export interface DashboardStatistics {
  todayRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  todayOrders: number;
  monthOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  activeCustomers: number;
  averageOrderValue: number;
  topSellingProducts: TopProduct[];
  revenueByDate: RevenueByDate[];
  ordersByStatus: OrderStatus[];
  paymentMethods: PaymentMethod[];
}

export interface TopProduct {
  productId: number;
  productName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  imageUrl?: string;
}

export interface RevenueByDate {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface OrderStatus {
  status: string;
  count: number;
  totalAmount: number;
}

export interface PaymentMethod {
  method: string;
  count: number;
  totalAmount: number;
}

// Sales Report Types
export interface SalesReport {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
  totalOrders: number;
  totalItemsSold: number;
  dailyRevenue: RevenueByDate[];
  topProducts: TopProduct[];
  salesByCategory: CategorySales[];
}

export interface CategorySales {
  categoryId?: number;
  categoryName: string;
  totalRevenue: number;
  totalQuantity: number;
}

// Inventory Statistics Types
export interface InventoryStatistics {
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalInventoryValue: number;
  lowStockItems: LowStockProduct[];
  stockByWarehouse: WarehouseStockStatistics[];
}

export interface LowStockProduct {
  productId: number;
  productName: string;
  currentStock: number;
  warehouseName?: string;
  price: number;
}

export interface WarehouseStockStatistics {
  warehouseId?: number;
  warehouseName: string;
  totalProducts: number;
  totalQuantity: number;
  totalValue: number;
}

// Customer Statistics Types
export interface CustomerStatistics {
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeCustomers: number;
  topCustomers: TopCustomer[];
}

export interface TopCustomer {
  customerId: number;
  customerName: string;
  totalOrders: number;
  totalSpent: number;
  phone?: string;
  email?: string;
}

// Statistics Service
class StatisticsService {
  async getDashboardStatistics(days: number = 30): Promise<DashboardStatistics> {
    const response = await apiClient.get<DashboardStatistics>(`/statistics/dashboard?days=${days}`);
    return response.data;
  }

  async getSalesReport(startDate?: string, endDate?: string): Promise<SalesReport> {
    let url = "/statistics/sales-report";
    const params = new URLSearchParams();
    
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await apiClient.get<SalesReport>(url);
    return response.data;
  }

  async getInventoryStatistics(lowStockThreshold: number = 10): Promise<InventoryStatistics> {
    const response = await apiClient.get<InventoryStatistics>(
      `/statistics/inventory?lowStockThreshold=${lowStockThreshold}`
    );
    return response.data;
  }

  async getCustomerStatistics(): Promise<CustomerStatistics> {
    const response = await apiClient.get<CustomerStatistics>("/statistics/customers");
    return response.data;
  }
}

export const statisticsService = new StatisticsService();
