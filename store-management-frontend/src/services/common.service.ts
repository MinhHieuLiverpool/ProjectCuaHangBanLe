import apiClient from "./api";
import {
  Customer,
  Category,
  Supplier,
  Promotion,
  CategoryProduct,
  CategoryDeleteRequest,
  CategoryDeleteResponse
} from "@/types";

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

async updateStatus(customerId: number, status: string): Promise<any> {
  const response = await apiClient.patch(`/customers/${customerId}/status`, { status });
  return response.data;
},


async delete(id: number): Promise<DeleteResponse> {
  const response = await apiClient.delete<DeleteResponse>(`/customers/${id}`);
  return response.data;
},

async checkPhoneExists(phone: string): Promise<boolean> {
  const response = await apiClient.get<{ exists: boolean }>(
    `/customers/check-phone`,
    { params: { phone } }
  );
  return response.data.exists; // ✅ trả về boolean
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
  async getProducts(id: number): Promise<CategoryProduct[]> {
    const response = await apiClient.get<CategoryProduct[]>(
      `/categories/${id}/products`
    );
    return response.data;
  },
  async checkHide(id: number): Promise<CategoryDeleteResponse> {
    const response = await apiClient.get<CategoryDeleteResponse>(
      `/categories/${id}/check-hide`
    );
    return response.data;
  },
      async create(data: Omit<Category, "categoryId">): Promise<Category> {
    const response = await apiClient.post<Category>("/categories", data).catch((error) => {
      if (error.response?.status === 400 && error.response.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    });
    return response.data;
  },
  async update(id: number, data: Partial<Category>): Promise<Category> {
    const response = await apiClient.put<Category>(`/categories/${id}`, data).catch((error) => {
      if (error.response?.status === 400 && error.response.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    });
    return response.data;
  },
  async restore(id: number): Promise<void> {
    await apiClient.patch(`/categories/${id}/restore`);
  },
  async hide(
    id: number,
    request?: CategoryDeleteRequest
  ): Promise<CategoryDeleteResponse> {
    const response = await apiClient.patch<CategoryDeleteResponse>(
      `/categories/${id}/hide`,
      request
    );
    return response.data;
  },
    async filter(search?: string, status?: string): Promise<Category[]> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status && status !== "all") params.append("status", status);

    const response = await apiClient.get<Category[]>(
      `/categories/filter?${params.toString()}`
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
  async canDelete(id: number): Promise<{
    canHardDelete: boolean;
    hasProducts: boolean;
    hasPurchaseOrders: boolean;
    message: string;
  }> {
    const response = await apiClient.get(`/suppliers/${id}/can-delete`);
    return response.data;
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
  async hide(id: number): Promise<{ message: string }> {
    const response = await apiClient.patch(`/suppliers/${id}/hide`);
    return response.data;
  },
  async delete(id: number): Promise<DeleteResponse> {
    const response = await apiClient.delete<DeleteResponse>(`/suppliers/${id}`);
    return response.data;
  },
  async search(searchTerm: string): Promise<Supplier[]> {
    const response = await apiClient.get<Supplier[]>(`/suppliers/search`, {
    params: { searchTerm },
    });
    return response.data;
    },
    async checkPhoneExists(phone: string): Promise<Supplier> {
    const response = await apiClient.get<Supplier>(`/suppliers/phone/${phone}`);
    return response.data;
},

    async checkEmailExists(email: string): Promise<Supplier> {
    const response = await apiClient.get<Supplier>(`/suppliers/email/${email}`);
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
  async search(params: {
    keyword?: string;
    discountType?: string;
    applyType?: string;
    fromDate?: string;
    toDate?: string;
    promotionStatus?: string;
  }): Promise<Promotion[]> {
    const response = await apiClient.get<Promotion[]>("/promotions/search", {
      params,
    });
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
