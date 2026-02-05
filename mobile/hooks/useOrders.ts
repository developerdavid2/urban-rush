import { useAxiosApi } from "@/lib/axios";
import { Order } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface ApiResponse {
  success: boolean;
  message: string;
  data: Order[];
}

export const useOrders = () => {
  const api = useAxiosApi();

  const {
    data: orders = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse>("/api/v1/orders/me");
      return data.data || [];
    },
  });

  return { orders, isLoading, isError, refetch, isFetching };
};
