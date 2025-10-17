export interface User {
  userId: number;
  username: string;
  fullName: string;
  role: "admin" | "staff";
  status: "active" | "inactive";
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  fullName: string;
  role: string;
  userId?: number;
}

export interface Product {
  productId: number;
  categoryId?: number;
  categoryName?: string;
  supplierId?: number;
  supplierName?: string;
  productName: string;
  barcode?: string;
  price: number;
  costPrice?: number;
  unit: string;
  status: string; // active || inactive
  stockQuantity?: number;
}

export interface CreateProductDto {
  categoryId?: number;
  supplierId?: number;
  productName: string;
  barcode?: string;
  price: number;
  costPrice: number;
  unit: string;
}

export interface ProductHistory {
  id: number;
  type: "purchase" | "sale";
  date: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  referenceNumber?: string;
  userName?: string;
  supplierName?: string;
  customerName?: string;
  notes?: string;
}

export interface Category {
  categoryId: number;
  categoryName: string;
  status: string; // "active" | "inactive"
}

export interface Supplier {
  supplierId: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  status: string; // "active" | "inactive"
}

export interface Warehouse {
  warehouseId: number;
  warehouseName: string;
  address?: string;
  status: string;
}

export interface Customer {
  customerId: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface Promotion {
  promoId: number;
  promoCode: string;
  description?: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  startDate: string;
  endDate: string;
  minOrderAmount: number;
  usageLimit: number;
  usedCount: number;
  status: "active" | "inactive";
  applyType?: "order" | "product" | "combo";
  products?: Array<{ productId: number; productName: string; price?: number }>;
}

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface CreateOrderDto {
  customerId?: number;
  userId?: number;
  promoCode?: string;
  items: OrderItem[];
}

export interface OrderItemResponse {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  discountAmount: number;
  discountPercent: number;
}

export interface OrderResponse {
  orderId: number;
  customerId?: number;
  customerName?: string;
  userId?: number;
  userName?: string;
  orderDate: string;
  status: "pending" | "paid" | "canceled";
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod?: string;
  paymentDate?: string;
  promoId?: number;
  promoCode?: string;
  promoType?: string;
  promoDescription?: string;
  items: OrderItemResponse[];
}

export interface PaymentDto {
  orderId: number;
  amount: number;
  paymentMethod: "cash" | "card" | "bank_transfer" | "e-wallet";
}

export interface CategoryProduct {
  productId: number;
  productName: string;
  categoryId?: number;
  categoryName?: string;
  status: string;
}

export interface CategoryDeleteRequest {
  // Map productId -> newCategoryId
  productCategoryMap?: Record<number, number>;
  hideProducts: boolean;
}

export interface CategoryDeleteResponse {
  success: boolean;
  message: string;
  softDeleted: boolean;
  categoryId: number;
  affectedProducts?: CategoryProduct[];
  productCount: number;
}
