import { axiosClient } from "@/lib/axios";
import { ApiResponse } from "@/types/api";
import { Order } from "@/types/order";

export const orderApi = {
  getAllOrders: async (): Promise<ApiResponse<Order[]>> => {
    const { data } = await axiosClient.get("/api/v1/orders");
    return data;
  },

  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    const { data } = await axiosClient.get(`/api/v1/orders/${id}`);
    return data;
  },

  createManualOrder: async (orderForm: Order): Promise<ApiResponse<Order>> => {
    const { data } = await axiosClient.post(
      `/api/v1/orders/manual/create`,
      orderForm
    );
    return data.data;
  },

  updateOrderStatus: async (
    id: string,
    newStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  ): Promise<ApiResponse<Order>> => {
    const { data } = await axiosClient.patch(`/api/v1/orders/${id}`, {
      orderStatus: newStatus,
    });
    return data;
  },
};
