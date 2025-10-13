import { CreateProductDto, Product } from "@/types";
import apiClient from "./api";

interface DeleteResponse {
  message: string;
  softDeleted: boolean;
}

export const productService = {
  async getAll(): Promise<Product[]> {
    const response = await apiClient.get<Product[]>("/products");
    return response.data;
  },

  async search(searchTerm: string): Promise<Product[]> {
    const response = await apiClient.get<Product[]>(`/products/search`, {
      params: { searchTerm },
    });
    return response.data;
  },

  async getById(id: number): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${id}`);
    return response.data;
  },

  async getByBarcode(barcode: string): Promise<Product> {
    const response = await apiClient.get<Product>(
      `/products/barcode/${barcode}`
    );
    return response.data;
  },

  async create(data: CreateProductDto): Promise<Product> {
    const response = await apiClient.post<Product>("/products", data);
    return response.data;
  },

  async update(id: number, data: Partial<Product>): Promise<Product> {
    const response = await apiClient.put<Product>(`/products/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<DeleteResponse> {
    const response = await apiClient.delete<DeleteResponse>(`/products/${id}`);
    return response.data;
  },

  async updateStock(productId: number, quantity: number): Promise<void> {
    await apiClient.put("/products/stock", { productId, quantity });
  },
};
