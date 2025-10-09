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

  async updateStatus(
    id: number,
    status: string,
    paymentMethod?: string
  ): Promise<void> {
    // Nếu status là "paid" và có paymentMethod, chỉ gọi API payment
    // (API payment sẽ tự động cập nhật status)
    if (status === "paid" && paymentMethod) {
      // Lấy thông tin order để biết số tiền
      const order = await this.getById(id);
      await this.processPayment({
        orderId: id,
        amount: order.finalAmount,
        paymentMethod: paymentMethod as
          | "cash"
          | "card"
          | "bank_transfer"
          | "e-wallet",
      });
      return; // Không cần gọi API updateStatus nữa
    }

    // Chỉ cập nhật status cho các trường hợp khác (canceled, pending)
    await apiClient.put(`/orders/${id}/status`, JSON.stringify(status), {
      headers: { "Content-Type": "application/json" },
    });
  },

  async processPayment(data: PaymentDto): Promise<void> {
    await apiClient.post("/orders/payment", data);
  },
};
