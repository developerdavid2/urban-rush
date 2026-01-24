import { axiosClient } from "@/lib/axios";

export const userApi = {
  getAllUsers: async () => {
    const { data } = await axiosClient.get("/api/v1/users");
    return data;
  },
  getUserById: async (id: string) => {
    const { data } = await axiosClient.get(`/api/v1/users/${id}`);
    return data;
  },
};
