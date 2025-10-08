import apiClient from "./api";
import {
  CreateOrderDto,
  OrderResponse,
  PaymentDto,
  UpdateOrderStatusDto,
} from "@/types";

export const orderService = {
  async getAll(): Promise<OrderResponse[]> {
    const response = await apiClient.get<OrderResponse[]>("/orders");
    return response.data;
  },

  async getById(id: number): Promise<OrderResponse> {
    const response = await apiClient.get<OrderResponse>(`/orders/${id}`);
    return response.data;
  },

  async create(data: CreateOrderDto): Promise<OrderResponse> {
    const response = await apiClient.post<OrderResponse>("/orders", data);
    return response.data;
  },

  async updateStatus(
    id: number,
    status: string,
    paymentMethod?: string
  ): Promise<void> {
    const payload: UpdateOrderStatusDto = { status, paymentMethod };
    await apiClient.put(`/orders/${id}/status`, payload);
  },

  async processPayment(data: PaymentDto): Promise<void> {
    await apiClient.post("/orders/payment", data);
  },
};
