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

  createProduct: async (formData: FormData) => {
    const { data } = await axiosClient.post("/api/v1/products", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return data;
  },

  updateProduct: async (id: string, formData: FormData) => {
    const { data } = await axiosClient.patch(
      `/api/v1/products/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return data;
  },
  deleteProduct: async (id: string) => {
    const { data } = await axiosClient.delete(`/api/v1/products/${id}`);

    return data;
  },
};
