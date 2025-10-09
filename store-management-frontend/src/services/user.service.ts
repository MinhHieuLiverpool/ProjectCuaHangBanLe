
import apiClient from "./api";

export const userService = {
  getAllUsers: async () => {
    const response = await apiClient.get("/users");
    return response.data;
  },

  createUser: async (data: { username: string; password: string; fullName?: string; role: string }) => {
    const response = await apiClient.post("/users", data);
    return response.data;
  },

  updateUser: async (userId: number, data: { fullName?: string; password?: string; role?: string }) => {
    const response = await apiClient.put(`/users/${userId}`, data);
    return response.data;
  },

  deleteUser: async (userId: number) => {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  },

  updatePassword: async (userId: number, newPassword: string) => {
    const response = await apiClient.put(`/users/${userId}/password`, {
    password: newPassword,
  });
    return response.data;
  },
};