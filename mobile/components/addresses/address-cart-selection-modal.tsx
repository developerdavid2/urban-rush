import { useAddresses } from "@/hooks/useAddresses";
import { Address } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { forwardRef } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import SheetLayout from "@/components/sheet-layout";
import { router } from "expo-router";

interface CartAddressSelectionModalProps {
  onProceed: (address: Address) => void;
  isProcessing: boolean;
  selectedAddress: Address | null;
  onSelectAddress: (address: Address) => void;
  onClose?: () => void;
}

const CartAddressSelectionModal = forwardRef<
  any,
  CartAddressSelectionModalProps
>(
  (
    { onProceed, isProcessing, selectedAddress, onSelectAddress, onClose },
    ref
  ) => {
    const { addresses, isLoading: addressesLoading } = useAddresses();

    return (
      <SheetLayout
        ref={ref}
        title="Select Shipping Address"
        snapPoints={["75%", "95%"]}
        onClose={onClose}
        footer={
          addresses.length > 0 && (
            <TouchableOpacity
              className={`rounded-xl py-4 items-center ${
                !selectedAddress || isProcessing
                  ? "bg-emerald-500/50"
                  : "bg-emerald-500"
              }`}
              activeOpacity={0.8}
              disabled={!selectedAddress || isProcessing}
              onPress={() => {
                if (selectedAddress) onProceed(selectedAddress);
              }}
            >
              {isProcessing ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#121212" />
                  <Text className="text-background font-bold ml-2">
                    Processing...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <Text className="text-background font-bold mr-2">
                    Continue to Payment
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color="#121212" />
                </View>
              )}
            </TouchableOpacity>
          )
        }
      >
        {/* Wrapper */}
        <View className="flex-1 relative">
          <View className="px-6 py-4">
            {addressesLoading ? (
              <View className="py-12 items-center justify-center">
                <ActivityIndicator size="large" color="#10b981" />
                <Text className="text-text-secondary mt-4">
                  Loading addresses...
                </Text>
              </View>
            ) : addresses.length === 0 ? (
              <View className="py-12 items-center justify-center">
                <Ionicons name="location-outline" size={64} color="#666" />
                <Text className="text-text-primary font-bold text-lg mt-4">
                  No addresses found
                </Text>
                <Text className="text-text-secondary text-center mt-2 mb-4">
                  Please add a shipping address first
                </Text>
                <TouchableOpacity
                  className="bg-emerald-500 rounded-2xl px-8 py-4"
                  onPress={() => {
                    onClose?.();
                    router.push("/addresses");
                  }}
                >
                  <Text className="text-background font-bold">Add Address</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="gap-4">
                {addresses.map((address: Address) => (
                  <TouchableOpacity
                    key={address._id}
                    className={`bg-surface rounded-2xl p-5 border-2 ${
                      selectedAddress?._id === address._id
                        ? "border-emerald-500"
                        : "border-surface"
                    }`}
                    activeOpacity={0.7}
                    onPress={() => onSelectAddress(address)}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                          <View
                            className="rounded-full size-8 items-center justify-center mr-2"
                            style={{ backgroundColor: "#10B98120" }}
                          >
                            <Ionicons
                              name="location-outline"
                              color="#10B981"
                              size={16}
                            />
                          </View>
                          <Text className="text-emerald-400 font-bold text-base">
                            {address.label}
                          </Text>
                          {address.isDefault && (
                            <View className="bg-emerald-500/20 rounded-full px-2 py-1 ml-2">
                              <Text className="text-emerald-400 text-xs font-semibold">
                                Default
                              </Text>
                            </View>
                          )}
                        </View>

                        <Text className="text-text-primary font-semibold text-base mb-1">
                          {address.fullName}
                        </Text>
                        <Text className="text-text-secondary text-sm leading-5 mb-1">
                          {address.street}
                        </Text>
                        <Text className="text-text-secondary text-sm mb-1">
                          {address.city}, {address.state} {address.postalCode}
                        </Text>
                        <Text className="text-text-secondary text-sm">
                          {address.phoneNumber}
                        </Text>
                      </View>

                      {selectedAddress?._id === address._id && (
                        <View className="bg-emerald-500 rounded-full p-2 ml-3">
                          <Ionicons
                            name="checkmark"
                            size={20}
                            color="#121212"
                          />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>
      </SheetLayout>
    );
  }
);

CartAddressSelectionModal.displayName = "CartAddressSelectionModal";

export default CartAddressSelectionModal;
