import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import React, { useState, useRef, useCallback } from "react";
import SafeScreen from "@/components/safe-screen";
import { useAddresses } from "@/hooks/useAddresses";
import { Ionicons } from "@expo/vector-icons";
import { Address } from "@/types";
import { AddressFormData } from "@/lib/validation/address.schema";
import SheetLayout from "@/components/sheet-layout";
import AddressForm from "@/components/addresses/address-form";
import { router } from "expo-router";

const Addresses = () => {
  const sheetRef = useRef<any>(null);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>();
  const [refreshing, setRefreshing] = useState(false);

  const {
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    isAddingAddress,
    isUpdatingAddress,
    isDeletingAddress,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useAddresses();

  const isMutating = isAddingAddress || isUpdatingAddress || isDeletingAddress;

  const openSheet = useCallback((address?: Address) => {
    setEditingAddress(address);
    sheetRef.current?.open();
  }, []);

  const closeSheet = useCallback(() => {
    sheetRef.current?.close();
    setEditingAddress(undefined);
  }, []);

  const handleSubmit = async (data: AddressFormData) => {
    try {
      if (editingAddress) {
        await updateAddress({
          addressId: editingAddress._id,
          addressData: data,
        });
      } else {
        await addAddress(data);
      }
      closeSheet();
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const handleDelete = (addressId: string, label: string) => {
    Alert.alert("Delete Address", `Delete "${label}" address?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteAddress(addressId);
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Loading State
  if (isLoading && !isFetching) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="text-text-primary mt-4">Loading addresses...</Text>
        </View>
      </SafeScreen>
    );
  }

  // Error State
  if (isError && !isFetching) {
    return (
      <SafeScreen>
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10b981"
            />
          }
        >
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
            <Text className="text-text-primary text-xl font-bold mt-4">
              Failed to load
            </Text>
            <TouchableOpacity
              className="bg-emerald-500 px-8 py-4 rounded-xl mt-6"
              onPress={() => refetch()}
            >
              <Text className="text-white font-bold">Retry</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View className="flex-1">
        {/*FIXED HEADER -*/}
        <View className="px-6 pb-5 border-b border-surface flex-row items-start bg-background">
          <TouchableOpacity
            onPress={() => {
              closeSheet();
              router.back();
            }}
            className="mr-4"
          >
            <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <View>
            <Text className="text-text-primary text-2xl font-bold">
              My Addresses
            </Text>
            <Text className="text-text-secondary mt-1">
              Manage your delivery addresses
            </Text>
          </View>
        </View>

        {/* SCROLLABLE CONTENT */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={
            addresses.length === 0 ? { flex: 1 } : { paddingBottom: 100 }
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#10b981"
            />
          }
        >
          {addresses.length === 0 ? (
            /* Empty State */
            <View className="flex-1 items-center justify-center px-6">
              <Ionicons name="location-outline" size={80} color="#666" />
              <Text className="text-text-primary text-xl font-bold mt-4">
                No addresses yet
              </Text>
              <Text className="text-text-secondary text-center mt-2">
                Add your first delivery address for faster checkout
              </Text>
              <TouchableOpacity
                className="bg-emerald-500 rounded-2xl px-10 py-5 mt-8 flex-row items-center"
                onPress={() => openSheet()}
                disabled={isMutating}
              >
                <Ionicons name="add" size={24} color="#000" />
                <Text className="text-black font-bold ml-3">Add Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Address List */
            <View className="px-6 py-4">
              {addresses.map((address) => (
                <View
                  key={address._id}
                  className="bg-surface rounded-2xl p-5 mb-4 border border-divider"
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-row gap-x-4 items-center">
                      <View
                        className="rounded-full size-10 items-center justify-center"
                        style={{ backgroundColor: "#10B981" + "20" }}
                      >
                        <Ionicons
                          name="location-outline"
                          color="#10B981"
                          size={20}
                        />
                      </View>
                      <Text className="text-text-primary font-bold text-lg">
                        {address.label}
                      </Text>
                    </View>
                    {address.isDefault && (
                      <View className="bg-emerald-500/20 px-3 py-1 rounded-full">
                        <Text className="text-emerald-400 text-xs font-semibold">
                          Default
                        </Text>
                      </View>
                    )}
                  </View>

                  <View className="mt-3">
                    <Text className="text-text-primary font-medium">
                      {address.fullName}
                    </Text>
                    <Text className="text-text-secondary text-sm mt-1">
                      {address.street}
                    </Text>
                    <Text className="text-text-secondary text-sm">
                      {address.city}, {address.state} {address.postalCode}
                    </Text>
                    <Text className="text-text-secondary text-sm mt-1">
                      {address.country} • {address.phoneNumber}
                    </Text>
                  </View>

                  <View className="flex-row mt-6 gap-3">
                    <TouchableOpacity
                      className="flex-1 bg-emerald-500/20 py-3 rounded-xl items-center"
                      onPress={() => openSheet(address)}
                      disabled={isMutating}
                    >
                      <Text className="text-emerald-400 font-semibold">
                        Edit
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 bg-red-500/20 py-3 rounded-xl items-center"
                      onPress={() => handleDelete(address._id, address.label)}
                      disabled={isMutating}
                    >
                      <Text className="text-red-400 font-semibold">Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* ✅ FIXED FOOTER - Only show if there are addresses */}
        {addresses.length > 0 && (
          <View className="absolute bottom-0 left-0 right-0 bg-background px-6 py-4 border-t border-surface">
            <TouchableOpacity
              className="bg-emerald-500 rounded-2xl py-4 items-center flex-row justify-center"
              onPress={() => openSheet()}
              disabled={isMutating}
            >
              <Ionicons name="add-circle-outline" size={24} color="#000" />
              <Text className="text-black font-bold ml-3">Add New Address</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal Sheet */}
      <SheetLayout
        ref={sheetRef}
        title={editingAddress ? "Edit Address" : "Add New Address"}
        snapPoints={["65%", "95%"]}
        onClose={() => setEditingAddress(undefined)}
      >
        <AddressForm
          address={editingAddress}
          onSubmit={handleSubmit}
          isSubmitting={isMutating}
          onClose={closeSheet}
        />
      </SheetLayout>
    </SafeScreen>
  );
};

export default Addresses;
