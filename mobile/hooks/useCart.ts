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
    refetch,
    isFetching,
  } = useQuery<Cart>({
    queryKey: ["cart"],
    queryFn: async () => {
      const { data } = await api.get<CartResponse>("/api/v1/cart");
      // Always return a Cart with at least empty items array
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
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to add to cart";
      toast.error(message);
    },
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
        { quantity }
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart updated!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to update cart";
      toast.error(message);
    },
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
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to remove from cart";
      toast.error(message);
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<CartResponse>("/api/v1/cart");
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Cart cleared successfully");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to clear cart";
      toast.error(message);
    },
  });

  /**
   * Check if a product is in the cart
   */
  const isInCart = (productId: string): boolean => {
    if (!cart?.items) return false;
    return cart.items.some((item) => item.product?._id === productId);
  };

  /**
   * Get the quantity of a specific product in cart
   */
  const getCartItemQuantity = (productId: string): number => {
    if (!cart?.items) return 0;
    const item = cart.items.find((item) => item.product?._id === productId);
    return item?.quantity ?? 0;
  };

  /**
   * Check if we can add more of a product to cart (based on stock)
   */
  const canAddToCart = (
    productId: string,
    product?: Product,
    quantityToAdd: number = 1
  ): boolean => {
    if (!product) return false;
    const currentQuantity = getCartItemQuantity(productId);
    return product.stock >= currentQuantity + quantityToAdd;
  };

  const hasQuantityChanged = (
    productId: string,
    localQuantity: number
  ): boolean => {
    const cartQuantity = getCartItemQuantity(productId);
    return cartQuantity !== localQuantity;
  };

  /**
   * Calculate total price of all items in cart
   */
  const cartTotal = (): number => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      if (!item.product) return sum;
      return sum + item.product.price * item.quantity;
    }, 0);
  };

  /**
   * Calculate total number of items in cart
   */
  const cartItemCount = (): number => {
    if (!cart?.items) return 0;
    return cart.items.reduce((sum, item) => {
      if (!item.product) return sum;
      return sum + item.quantity;
    }, 0);
  };

  return {
    // Cart data
    cart: cart || { items: [] },
    cartItemCount: cartItemCount(),
    cartTotal: cartTotal(),

    // Loading states
    isLoading,
    isError,
    isFetching,

    // Helper functions
    isInCart,
    getCartItemQuantity,
    canAddToCart,
    hasQuantityChanged,

    // Mutations
    addToCart: addToCartMutation.mutate,
    updateCartItem: updateCartItemMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,

    // Mutation states
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartItemMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
    isClearingCart: clearCartMutation.isPending,

    // Refetch function
    refetch,
  };
};

export default useCart;
