import { useAxiosApi } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Cart, CartItem, Product } from "@/types";
import { toast } from "@backpackapp-io/react-native-toast";

interface CartResponse {
  success: boolean;
  data: Cart;
}

interface AddToCartResponse {
  success: boolean;
  message: string;
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
      return data.data;
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({
      productId,
      quantity = 1,
    }: {
      productId: string;
      quantity?: number;
      product?: Product;
    }) => {
      const { data } = await api.post<AddToCartResponse>("/api/v1/cart/items", {
        productId,
        quantity,
      });
      return data.data;
    },
    onMutate: async ({ productId, quantity = 1, product }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData<Cart>(["cart"]);

      queryClient.setQueryData<Cart>(["cart"], (old) => {
        if (!old) {
          return {
            _id: "temp",
            user: "",
            clerkId: "",
            items: [
              {
                _id: `temp-${productId}`,
                product: product || ({ _id: productId } as Product),
                quantity,
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }

        const existingItemIndex = old.items.findIndex(
          (item) => item.product?._id === productId
        );

        if (existingItemIndex !== -1) {
          const updatedItems = [...old.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + quantity,
          };

          return {
            ...old,
            items: updatedItems,
          };
        }

        return {
          ...old,
          items: [
            ...old.items,
            {
              _id: `temp-${productId}`,
              product: product || ({ _id: productId } as Product),
              quantity,
            },
          ],
        };
      });

      toast.success("Added to cart!");

      return { previousCart };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      const message = error.response?.data?.message || "Failed to add to cart";
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
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
      const { data } = await api.patch<AddToCartResponse>(
        `/api/v1/cart/items/${productId}`,
        { quantity }
      );
      return data.data;
    },
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData<Cart>(["cart"]);

      queryClient.setQueryData<Cart>(["cart"], (old) => {
        if (!old) return old;

        return {
          ...old,
          items: old.items.map((item) =>
            item.product?._id === productId ? { ...item, quantity } : item
          ),
        };
      });

      toast.success("Cart updated!");

      return { previousCart };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      toast.error("Failed to update cart");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await api.delete<AddToCartResponse>(
        `/api/v1/cart/items/${productId}`
      );
      return data.data;
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData<Cart>(["cart"]);

      queryClient.setQueryData<Cart>(["cart"], (old) => {
        if (!old) return old;

        return {
          ...old,
          items: old.items.filter((item) => item.product?._id !== productId),
        };
      });

      toast.success("Removed from cart");

      return { previousCart };
    },
    onError: (error: any, productId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      toast.error("Failed to remove from cart");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<AddToCartResponse>("/api/v1/cart");
      return data.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      const previousCart = queryClient.getQueryData<Cart>(["cart"]);

      queryClient.setQueryData<Cart>(["cart"], (old) => {
        if (!old) return old;
        return { ...old, items: [] };
      });

      toast.success("Cart cleared");

      return { previousCart };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      toast.error("Failed to clear cart");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });

  // ✅ Fixed: Safely check for product existence
  const isInCart = (productId: string) => {
    if (!cart?.items || cart.items.length === 0) return false;
    return cart.items.some((item) => item.product?._id === productId);
  };

  // ✅ Fixed: Safely check for product existence
  const getCartItemQuantity = (productId: string) => {
    if (!cart?.items) return 0;
    const item = cart.items.find((item) => item.product?._id === productId);
    return item?.quantity || 0;
  };

  return {
    cart: cart || { items: [] },
    items: cart?.items || [],
    isLoading,
    isError,
    cartCount: cart?.items?.length || 0,
    totalItems: cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
    isInCart,
    getCartItemQuantity,
    addToCart: (productId: string, quantity?: number, product?: Product) =>
      addToCartMutation.mutate({ productId, quantity, product }),
    updateCartItem: updateCartItemMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartItemMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
  };
};

export default useCart;
