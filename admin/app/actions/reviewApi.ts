import { axiosClient } from "@/lib/axios";

export const reviewApi = {
  getReviewsByProductId: async (id: string) => {
    const { data } = await axiosClient.get(`/api/v1/reviews/products/${id}`);
    return data;
  },
};
