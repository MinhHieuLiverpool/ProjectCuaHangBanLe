import apiClient from "./api";
import { CreateOrderDto, OrderResponse, PaymentDto } from "@/types";

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

  async updateStatus(id: number, status: string): Promise<void> {
    await apiClient.put(`/orders/${id}/status`, JSON.stringify(status), {
      headers: { "Content-Type": "application/json" },
    });
  },

  async processPayment(data: PaymentDto): Promise<void> {
    await apiClient.post("/orders/payment", data);
  },
};
