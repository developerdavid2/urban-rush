import { useAxiosApi } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Cart, Product } from "@/types";
import { toast } from "@backpackapp-io/react-native-toast";

interface CartResponse {
  success: boolean;
  data: Cart;
}

const useCart = () => {
  const api = useAxiosApi();
  const queryClient = useQueryClient();

  const {
    data: cart,
    isLoading,
    isError,
  } = useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await api.get<CartResponse>("/api/v1/cart");
      return data.data || { items: [] };
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
    }: {
      productId: string;
      quantity?: number;
    }) => {
      const { data } = await api.post<CartResponse>("/api/v1/cart/items", {
        productId,
        quantity,
      });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Added to cart!");
    },
    onError: () => toast.error("Failed to add to cart"),
  });

  const updateCartItemMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity,
    }: {
      productId: string;
      quantity: number;
    }) => {
      const { data } = await api.patch<CartResponse>(
        `/api/v1/cart/items/${productId}`,
        {
          quantity,
        }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart updated!");
    },
    onError: () => toast.error("Failed to update cart"),
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await api.delete<CartResponse>(
        `/api/v1/cart/items/${productId}`
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Removed from cart");
    },
    onError: () => toast.error("Failed to remove from cart"),
  });

  const isInCart = (productId: string) => {
    return (
      cart?.items.some((item) => item.productId?._id === productId) ?? false
    );
  };

  const getCartItemQuantity = (productId: string) => {
    const item = cart?.items.find((item) => item.productId?._id === productId);
    return item?.quantity ?? 0;
  };

  const canAddToCart = (productId: string, product?: Product, qtyToAdd = 1) => {
    if (!product) return false;
    const current = getCartItemQuantity(productId);
    return product.stock >= current + qtyToAdd;
  };

  const hasQuantityChanged = (productId: string, currentQty: number) => {
    return getCartItemQuantity(productId) !== currentQty;
  };

  return {
    cart: cart || { items: [] },
    isLoading,
    isError,
    isInCart,
    getCartItemQuantity,
    canAddToCart,
    hasQuantityChanged,
    addToCart: addToCartMutation.mutate,
    updateCartItem: updateCartItemMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartItemMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
  };
};

export default useCart;
