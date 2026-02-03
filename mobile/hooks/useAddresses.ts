import { useAxiosApi } from "@/lib/axios";
import { Address } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@backpackapp-io/react-native-toast";

export const useAddresses = () => {
  const api = useAxiosApi();
  const queryClient = useQueryClient();

  const {
    data: addresses,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const { data } = await api.get<{ success: boolean; data: Address[] }>(
        "/api/v1/users/me/addresses"
      );
      return data.data || [];
    },
    staleTime: 0,
    refetchIntervalInBackground: true,
  });

  const addAddressMutation = useMutation({
    mutationFn: async (addressData: Omit<Address, "_id">) => {
      const { data } = await api.post<{
        success: boolean;
        data: any;
        message?: string;
      }>("/api/v1/users/me/addresses", addressData);
      if (!data.success) throw new Error(data.message || "Add failed");
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      refetch();
      toast.success("Address added successfully!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to add address";
      toast.error(message);
      console.error("Add address error:", error);
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({
      addressId,
      addressData,
    }: {
      addressId: string;
      addressData: Partial<Address>;
    }) => {
      const { data } = await api.patch<{ success: boolean; data: Address[] }>(
        `/api/v1/users/me/addresses/${addressId}`,
        addressData
      );
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["addresses"] });
      refetch();
      toast.success("Address updated successfully!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update address";
      toast.error(message);
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      const { data } = await api.delete<{ success: boolean; data: Address[] }>(
        `/api/v1/users/me/addresses/${addressId}`
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      toast.success("Address deleted successfully!");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to delete address";
      toast.error(message);
    },
  });

  return {
    addresses: addresses || [],
    isLoading,
    isError,
    isFetching,
    refetch,
    addAddress: addAddressMutation.mutateAsync,
    updateAddress: updateAddressMutation.mutateAsync,
    deleteAddress: deleteAddressMutation.mutateAsync,
    isAddingAddress: addAddressMutation.isPending,
    isUpdatingAddress: updateAddressMutation.isPending,
    isDeletingAddress: deleteAddressMutation.isPending,
  };
};
