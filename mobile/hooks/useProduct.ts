import { useAxiosApi } from "@/lib/axios";
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

const useProduct = (productId?: string) => {
  const api = useAxiosApi();

  const { data, isLoading, isError } = useQuery<ApiResponse<Product>>({
    queryKey: ["product", productId],
    queryFn: async () => {
      const res = await api.get(`/api/v1/products/${productId}`);
      return res.data;
    },
    enabled: !!productId,
  });

  return {
    product: data?.data,
    isLoading,
    isError,
  };
};

export default useProduct;
