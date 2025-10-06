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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  saveAuth(token: string, user: LoginResponse) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  },
};
