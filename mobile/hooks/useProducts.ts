import { useAxiosApi } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";

const useProducts = () => {
  const api = useAxiosApi();

  const result = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get("/api/v1/products");
      return data;
    },
  });
  return result;
};

export default useProducts;
