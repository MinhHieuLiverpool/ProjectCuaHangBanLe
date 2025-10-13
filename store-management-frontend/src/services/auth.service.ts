import apiClient from "./api";
import { LoginRequest, LoginResponse } from "@/types";

export const authService = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/login", data);
    return response.data;
  },

  async register(data: {
    username: string;
    password: string;
    fullName: string;
    role: string;
  }) {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },

  logout() {
    localStorage.removeItem("user");
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  saveAuth(user: LoginResponse) {
    localStorage.setItem("user", JSON.stringify(user));
  },
};
