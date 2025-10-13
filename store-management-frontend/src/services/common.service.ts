import apiClient from "./api";
import { Customer, Category, Supplier, Promotion } from "@/types";

interface DeleteResponse {
  message: string;
  softDeleted: boolean;
}

export const customerService = {
  async getAll(): Promise<Customer[]> {
    const response = await apiClient.get<Customer[]>("/customers");
    return response.data;
  },
  async create(
    data: Omit<Customer, "customerId" | "createdAt">
  ): Promise<Customer> {
    const response = await apiClient.post<Customer>("/customers", data);
    return response.data;
  },
  async update(id: number, data: Partial<Customer>): Promise<Customer> {
    const response = await apiClient.put<Customer>(`/customers/${id}`, data);
    return response.data;
  },
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },
};

export const categoryService = {
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>("/categories");
    return response.data;
  },
  async getActive(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>("/categories");
    return response.data.filter((c) => c.status === "active");
  },
  async create(data: Omit<Category, "categoryId">): Promise<Category> {
    const response = await apiClient.post<Category>("/categories", data);
    return response.data;
  },
  async update(id: number, data: Partial<Category>): Promise<Category> {
    const response = await apiClient.put<Category>(`/categories/${id}`, data);
    return response.data;
  },
  async restore(id: number): Promise<void> {
    await apiClient.patch(`/categories/${id}/restore`);
  },
  async delete(id: number): Promise<DeleteResponse> {
    const response = await apiClient.delete<DeleteResponse>(
      `/categories/${id}`
    );
    return response.data;
  },
};

export const supplierService = {
  async getAll(): Promise<Supplier[]> {
    const response = await apiClient.get<Supplier[]>("/suppliers");
    return response.data;
  },
  async getActive(): Promise<Supplier[]> {
    const response = await apiClient.get<Supplier[]>("/suppliers");
    return response.data.filter((s) => s.status === "active");
  },
  async create(data: Omit<Supplier, "supplierId">): Promise<Supplier> {
    const response = await apiClient.post<Supplier>("/suppliers", data);
    return response.data;
  },
  async update(id: number, data: Partial<Supplier>): Promise<Supplier> {
    const response = await apiClient.put<Supplier>(`/suppliers/${id}`, data);
    return response.data;
  },
  async restore(id: number): Promise<void> {
    await apiClient.patch(`/suppliers/${id}/restore`);
  },
  async delete(id: number): Promise<DeleteResponse> {
    const response = await apiClient.delete<DeleteResponse>(`/suppliers/${id}`);
    return response.data;
  },
};

export const promotionService = {
  async getAll(): Promise<Promotion[]> {
    const response = await apiClient.get<Promotion[]>("/promotions");
    return response.data;
  },
  async getActive(): Promise<Promotion[]> {
    const response = await apiClient.get<Promotion[]>("/promotions/active");
    return response.data;
  },
  async getByCode(code: string): Promise<Promotion> {
    const response = await apiClient.get<Promotion>(`/promotions/code/${code}`);
    return response.data;
  },
  async create(
    data: Omit<Promotion, "promoId" | "usedCount">
  ): Promise<Promotion> {
    const response = await apiClient.post<Promotion>("/promotions", data);
    return response.data;
  },
  async update(id: number, data: Partial<Promotion>): Promise<Promotion> {
    const response = await apiClient.put<Promotion>(`/promotions/${id}`, data);
    return response.data;
  },
  async delete(id: number): Promise<void> {
    await apiClient.delete(`/promotions/${id}`);
  },
};
