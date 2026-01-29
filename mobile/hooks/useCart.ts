import { useAxiosApi } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Cart } from "@/types";
import { toast } from "@backpackapp-io/react-native-toast";

const useCart = () => {
  const api = useAxiosApi();
  const queryClient = useQueryClient();

  // todo: complete this hook
  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
    }: {
      productId: string;
      quantity?: number;
    }) => {
      const { data } = await api.post<{ cart: Cart }>("/api/v1/cart", {
        productId,
        quantity,
      });

      return data.cart;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Product Added to cart", {
        width: 300,
      });
    },

    onError: () => {
      toast.error("Failed to add to cart");
    },
  });

  return {
    addToCart: addToCartMutation.mutateAsync,
    isAddingToCart: addToCartMutation.isPending,
  };
};

export default useCart;
