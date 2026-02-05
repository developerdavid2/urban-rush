import { useAxiosApi } from "@/lib/axios";
import { Review } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateReviewData {
  productId: string;
  orderId: string;
  rating: number;
  review?: string;
}

interface CreateReviewResponse {
  success: boolean;
  message: string;
  data: Review[];
}
export const useReviews = () => {
  const api = useAxiosApi();
  const queryClient = useQueryClient();

  const createReview = useMutation({
    mutationFn: async (reviewData: CreateReviewData) => {
      const { data } = await api.post<CreateReviewResponse>(
        "/api/v1/reviews",
        reviewData
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return {
    isCreatingReview: createReview.isPending,
    createReviewAsync: createReview.mutateAsync,
  };
};
