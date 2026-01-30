import { useAxiosApi } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

const useProducts = () => {
  const api = useAxiosApi();

  const {
    data: products = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/products");
      return data;
    },
    staleTime: 0,
  });
  return { products, isLoading, isError, refetch };
};

export default useProducts;
