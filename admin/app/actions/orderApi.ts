import { axiosClient } from "@/lib/axios";

export const orderApi = {
  getAllOrders: async () => {
    const { data } = await axiosClient.get("/api/v1/orders");
    return data;
  },
  getOrderById: async (id: string) => {
    const { data } = await axiosClient.get(`/api/v1/orders/${id}`);
    return data;
  },

  getDashboardStats: async () => {
    const { data } = await axiosClient.get("/api/v1/orders/dashboard/stats");
    return data;
  },

  updateOrderStatus: async (id: string) => {
    const { data } = await axiosClient.patch(`/api/v1/orders/${id}/status`);
    return data;
  },
};
