import { axiosServer } from "@/lib/axios";

export const productApi = {
  getAllProducts: async () => {
    const { data } = await axiosServer.get("/api/v1/products");
    return data;
  },
  getProductById: async (id: string) => {
    const { data } = await axiosServer.get(`/api/v1/products/${id}`);
    return data;
  },

  createProduct: async (formData: FormData) => {
    const { data } = await axiosServer.post("/api/v1/products", formData);
    return data;
  },

  updateProduct: async (id: string, formData: FormData) => {
    const { data } = await axiosServer.patch(
      `/api/v1/products/${id}`,
      formData
    );
    return data;
  },
  deleteProduct: async (id: string) => {
    const { data } = await axiosServer.delete(`/api/v1/products/${id}`);

    return data;
  },
};
