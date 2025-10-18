import apiClient from "./api";

export interface ComboItem {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

export interface ComboPromotion {
  comboId: number;
  comboName: string;
  description?: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  status: string;
  items: ComboItem[];
}

export interface CreateComboPromotion {
  comboName: string;
  description?: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  items: { productId: number; quantity: number }[];
}

export const comboPromotionService = {
  async getAll(): Promise<ComboPromotion[]> {
    const response = await apiClient.get<ComboPromotion[]>("/combopromotions");
    return response.data;
  },

  async getById(id: number): Promise<ComboPromotion> {
    const response = await apiClient.get<ComboPromotion>(`/combopromotions/${id}`);
    return response.data;
  },

  async create(data: CreateComboPromotion): Promise<ComboPromotion> {
    const response = await apiClient.post<ComboPromotion>("/combopromotions", data);
    return response.data;
  },

  async update(
    id: number,
    data: Partial<CreateComboPromotion>
  ): Promise<ComboPromotion> {
    const response = await apiClient.put<ComboPromotion>(
      `/combopromotions/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/combopromotions/${id}`);
  },
};
