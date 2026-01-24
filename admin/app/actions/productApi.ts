import { axiosClient } from "@/lib/axios";

export const productApi = {
  getAllProducts: async () => {
    const { data } = await axiosClient.get("/api/v1/products");
    return data;
  },
  getProductById: async (id: string) => {
    const { data } = await axiosClient.get(`/api/v1/products/${id}`);
    return data;
  },

  createProduct: async (payload: Record<string, unknown>) => {
    const { data } = await axiosClient.post("/api/v1/products", payload);
    return data;
  },

  updateProduct: async (id: string, payload: Record<string, unknown>) => {
    const { data } = await axiosClient.patch(`/api/v1/products/${id}`, payload);

    return data;
  },
  deleteProduct: async (id: string) => {
    const { data } = await axiosClient.delete(`/api/v1/products/${id}`);

    return data;
  },

  //   TEST API ENDPOINTS
  getHealth: async () => {
    const { data } = await axiosClient.get("/api/health");

    return data;
  },
};
