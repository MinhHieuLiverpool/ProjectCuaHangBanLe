export interface User {
  userId: number;
  username: string;
  fullName: string;
  role: "admin" | "staff";
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
  unit: string;
  initialStock: number;
}

export interface Category {
  categoryId: number;
  categoryName: string;
}

export interface Supplier {
  supplierId: number;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
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
  items: OrderItemResponse[];
}

export interface PaymentDto {
  orderId: number;
  amount: number;
  paymentMethod: "cash" | "card" | "bank_transfer" | "e-wallet";
}
