import { useAxiosApi } from "@/lib/axios";
import { Product } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@backpackapp-io/react-native-toast";

interface WishlistResponse {
  success: boolean;
  data: Product[];
}

interface AddToWishlistResponse {
  success: boolean;
  message: string;
  data: Product[];
}

interface RemoveFromWishlistResponse {
  success: boolean;
  message: string;
}

const useWishlist = () => {
  const api = useAxiosApi();
  const queryClient = useQueryClient();

  const {
    data: wishlist = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data } = await api.get<WishlistResponse>(
        "/api/v1/users/me/wishlist"
      );
      return data.data || [];
    },
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async ({
      productId,
    }: {
      productId: string;
      product?: Product;
    }) => {
      const { data } = await api.post<AddToWishlistResponse>(
        "/api/v1/users/me/wishlist",
        { productId }
      );
      return data.data;
    },
    onMutate: async ({ productId, product }) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      const previousWishlist = queryClient.getQueryData<Product[]>([
        "wishlist",
      ]);

      queryClient.setQueryData<Product[]>(["wishlist"], (old = []) => [
        ...old,
        product || ({ _id: productId } as Product),
      ]);

      // ✅ Show success toast immediately
      toast.success("Added to wishlist!");

      return { previousWishlist };
    },
    onError: (error: any, variables, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
      const message =
        error.response?.data?.message || "Failed to add to wishlist";
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await api.delete<RemoveFromWishlistResponse>(
        `/api/v1/users/me/wishlist/${productId}`
      );
      return data;
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });

      const previousWishlist = queryClient.getQueryData<Product[]>([
        "wishlist",
      ]);

      queryClient.setQueryData<Product[]>(["wishlist"], (old = []) =>
        old.filter((product) => product._id !== productId)
      );

      toast.success("Removed from wishlist");

      return { previousWishlist };
    },
    onError: (error: any, productId, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
      const message =
        error.response?.data?.message || "Failed to remove from wishlist";
      toast.error(message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const isInWishlist = (productId: string) => {
    if (!Array.isArray(wishlist) || wishlist.length === 0) {
      return false;
    }
    return wishlist.some((product) => product._id === productId);
  };

  const toggleWishlist = (productId: string, product?: Product) => {
    if (isInWishlist(productId)) {
      removeFromWishlistMutation.mutate(productId);
    } else {
      addToWishlistMutation.mutate({ productId, product });
    }
  };

  return {
    wishlist: wishlist || [],
    isLoading,
    isError,
    wishlistCount: wishlist?.length || 0,
    isInWishlist,
    toggleWishlist,
    addToWishlist: (productId: string, product?: Product) =>
      addToWishlistMutation.mutate({ productId, product }),
    removeFromWishlist: removeFromWishlistMutation.mutate,
    refetch,
  };
};

export default useWishlist;
