import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import SafeScreen from "@/components/safe-screen";
import useCart from "@/hooks/useCart";
import { RefreshControl, ScrollView } from "react-native-gesture-handler";
import { useAddresses } from "@/hooks/useAddresses";
import { Address, Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { cn } from "@/lib/utils";
import OrderSummary from "@/components/orders/order-summary";
import CartAddressSelectionModal from "@/components/addresses/address-cart-selection-modal";
import { useAxiosApi } from "@/lib/axios";

import { useStripe } from "@stripe/stripe-react-native";

const CartTabScreen = () => {
  const addressSheetRef = useRef<any>(null);
  const [localQuantities, setLocalQuantities] = useState<
    Record<string, number>
  >({});
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const api = useAxiosApi();
  const {
    cart,
    cartTotal,
    isError,
    isLoading,
    isRemovingFromCart,
    isUpdatingCart,
    removeFromCart,
    updateCartItem,
    getCartItemQuantity,
    hasQuantityChanged,
    clearCart,
  } = useCart();

  const { addresses, refetch } = useAddresses();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const cartItems = cart?.items;
  const subtotal = cartTotal;
  const shipping = 10.0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Sync local quantities when cart data loads/changes
  useEffect(() => {
    const initialQuantities: Record<string, number> = {};
    cartItems?.forEach((item) => {
      if (!item.product?._id) return;
      initialQuantities[item.product._id] = item.quantity;
    });
    setLocalQuantities(initialQuantities);
  }, [cartItems]);

  const handleQuantityChange = (productId: string, newQty: number) => {
    setLocalQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, newQty),
    }));
  };

  const handleUpdateItem = (product: Product) => {
    const productId = product._id;
    const newQuantity = localQuantities[productId];
    if (!newQuantity || newQuantity === getCartItemQuantity(productId)) return;

    setUpdatingItemId(productId);
    updateCartItem({ productId, quantity: newQuantity });
  };

  useEffect(() => {
    if (!isUpdatingCart && updatingItemId) {
      setUpdatingItemId(null);
    }
  }, [isUpdatingCart, updatingItemId]);

  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert("Remove Item", `Remove ${productName} from cart?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFromCart(productId),
      },
    ]);
  };

  // Open address selection sheet
  const handleCheckout = () => {
    if (!cartItems || cartItems.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty", [{ text: "OK" }]);
      return;
    }

    if (!addresses || addresses.length === 0) {
      Alert.alert(
        "No Address",
        "Please add a shipping address in your profile",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add Address",
            onPress: () => router.push("/addresses"),
          },
        ]
      );
      return;
    }

    const defaultAddress = addresses.find((addr) => addr.isDefault);
    if (defaultAddress) {
      setSelectedAddress(defaultAddress);
    }

    addressSheetRef.current?.open();
  };

  const handleProceedToPayment = async (address: Address) => {
    setPaymentLoading(true);
    try {
      setPaymentLoading(true);
      // create payment with cart items and shipping address

      const { data } = await api.post("/api/v1/payment/create-intent", {
        cartItems,
        shippingAddress: {
          fullName: selectedAddress?.fullName,
          street: selectedAddress?.street,
          city: selectedAddress?.city,
          country: selectedAddress?.country,
          state: selectedAddress?.state,
          postalCode: selectedAddress?.postalCode,
          phoneNumber: selectedAddress?.phoneNumber,
        },
      });

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: data.clientSecret,
        merchantDisplayName: "Urban Rush",
      });

      if (initError) {
        Alert.alert("Error", initError.message);
        setPaymentLoading(false);
        return;
      }
      //present the payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        Alert.alert("Paymenr cancelled", presentError.message);
      } else {
        Alert.alert(
          "Success",
          "Your payment was successful! Your order is being processed",
          [
            {
              text: "OK",
              onPress: () => {
                // router.push("/orders");
              },
            },
          ]
        );
        addressSheetRef.current?.close();
        clearCart();
      }
    } catch (error) {
      console.error("Payment error:", error);
      Alert.alert("Error", "Failed to process payment");
    } finally {
      setPaymentLoading(false);
    }
  };

  if (isLoading) return <LoadingUI />;
  if (isError || !cart) return <ErrorUI />;
  if (!cartItems || cartItems.length === 0) return <EmptyUI />;

  const isCartBusy = isUpdatingCart || isRemovingFromCart;
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeScreen>
      <Text className="px-6 pb-5 text-text-primary text-3xl font-bold tracking-tight">
        Cart ({cartItems.length})
      </Text>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 240 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#10b981"
          />
        }
      >
        <View className="px-6 gap-y-4">
          {cartItems.map((item) => {
            const product = item.product;
            if (!product) return null;

            const localQty = localQuantities[product._id] ?? item.quantity;
            const hasChanged = hasQuantityChanged(product._id, localQty);
            const isThisItemUpdating = updatingItemId === product._id;

            return (
              <TouchableOpacity
                key={item._id}
                className="bg-surface rounded-3xl overflow-hidden flex"
                activeOpacity={0.9}
                onPress={() =>
                  router.push({
                    pathname: "/products/[productId]",
                    params: { productId: product._id },
                  })
                }
                disabled={isCartBusy}
              >
                <View className="p-4 flex-col">
                  <View className="flex-row">
                    <View className="relative">
                      <Image
                        source={product.images[0]}
                        className="bg-background-lighter"
                        contentFit="cover"
                        style={{ width: 100, height: 100, borderRadius: 16 }}
                      />
                      <View className="absolute top-2 right-2 bg-emerald-500 rounded-full size-6 items-center justify-center">
                        <Text className="text-background text-xs font-bold">
                          {item.quantity}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-1 ml-4 justify-between">
                      <View>
                        <Text
                          className="text-text-primary font-bold text-lg leading-tight"
                          numberOfLines={2}
                        >
                          {product.name}
                        </Text>

                        <View className="flex-row items-center mt-2">
                          <Text className="text-primary-dark font-bold text-xl">
                            ${(product.price * localQty).toFixed(2)}
                          </Text>
                          <Text className="text-text-secondary text-sm ml-2">
                            ${product.price.toFixed(2)} each
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row justify-between items-center">
                        <View className="mt-4">
                          <View className="flex-row items-center">
                            <TouchableOpacity
                              className="bg-background-lighter rounded-full w-10 h-10 items-center justify-center"
                              onPress={() =>
                                handleQuantityChange(product._id, localQty - 1)
                              }
                              disabled={
                                localQty <= 1 ||
                                isThisItemUpdating ||
                                isCartBusy
                              }
                            >
                              <Ionicons
                                name="remove"
                                size={20}
                                color={
                                  localQty <= 1 ||
                                  isThisItemUpdating ||
                                  isCartBusy
                                    ? "#444"
                                    : "#FFFFFF"
                                }
                              />
                            </TouchableOpacity>

                            <Text className="text-text-primary text-xl font-bold mx-4">
                              {localQty}
                            </Text>

                            <TouchableOpacity
                              className="bg-primary rounded-full w-10 h-10 items-center justify-center"
                              onPress={() =>
                                handleQuantityChange(product._id, localQty + 1)
                              }
                              disabled={
                                localQty >= product.stock ||
                                isThisItemUpdating ||
                                isCartBusy
                              }
                            >
                              <Ionicons
                                name="add"
                                size={20}
                                color={
                                  localQty >= product.stock ||
                                  isThisItemUpdating ||
                                  isCartBusy
                                    ? "#444"
                                    : "#121212"
                                }
                              />
                            </TouchableOpacity>
                          </View>
                        </View>

                        <TouchableOpacity
                          className="mt-4 p-2"
                          onPress={() =>
                            handleRemoveItem(product._id, product.name)
                          }
                          disabled={isCartBusy}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={24}
                            color="#FF6B6B"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {hasChanged && (
                    <TouchableOpacity
                      className={cn(
                        "mt-3 bg-[#F59E0B]/20 rounded-xl py-3 items-center flex-row justify-center",
                        isThisItemUpdating && "opacity-70"
                      )}
                      onPress={() => handleUpdateItem(product)}
                      disabled={isThisItemUpdating || isCartBusy}
                    >
                      {isThisItemUpdating ? (
                        <>
                          <ActivityIndicator size="small" color="#F59E0B" />
                          <Text className="text-[#F59E0B] font-bold ml-2">
                            Updating...
                          </Text>
                        </>
                      ) : (
                        <Text className="text-[#F59E0B] font-bold">
                          Update Cart
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <OrderSummary
          subtotal={subtotal}
          shipping={shipping}
          tax={tax}
          total={total}
        />
      </ScrollView>

      {/* Checkout Bar */}
      <View className="absolute bottom-20 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-surface px-6 py-4 pb-8">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Ionicons name="cart" size={20} color="#10b981" />
            <Text className="text-text-secondary ml-2">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <Text className="text-text-primary font-bold text-2xl">
              ${total.toFixed(2)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-emerald-500 rounded-2xl py-4 items-center"
          onPress={handleCheckout}
          disabled={isCartBusy || cartItems.length === 0}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center justify-center">
            <Text className="text-background font-bold text-lg mr-2">
              Checkout
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#121212" />
          </View>
        </TouchableOpacity>
      </View>

      {/*  Address Selection Sheet */}
      <CartAddressSelectionModal
        ref={addressSheetRef}
        selectedAddress={selectedAddress}
        onSelectAddress={setSelectedAddress}
        onProceed={handleProceedToPayment}
        isProcessing={paymentLoading}
        onClose={() => setSelectedAddress(null)}
      />
    </SafeScreen>
  );
};

export default CartTabScreen;

function LoadingUI() {
  return (
    <View className="flex-1 bg-background items-center justify-center">
      <ActivityIndicator size="large" color="#00D9FF" />
      <Text className="text-text-secondary mt-4">Loading cart...</Text>
    </View>
  );
}

function ErrorUI() {
  return (
    <View className="flex-1 bg-background items-center justify-center px-6">
      <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
      <Text className="text-text-primary font-semibold text-xl mt-4">
        Failed to load cart
      </Text>
      <Text className="text-text-secondary text-center mt-2">
        Please check your connection and try again
      </Text>
    </View>
  );
}

function EmptyUI() {
  return (
    <View className="flex-1 bg-background">
      <View className="px-6 pt-16 pb-5">
        <Text className="text-text-primary text-3xl font-bold tracking-tight">
          Cart
        </Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="cart-outline" size={80} color="#666" />
        <Text className="text-text-primary font-semibold text-xl mt-4">
          Your cart is empty
        </Text>
        <Text className="text-text-secondary text-center mt-2">
          Add some products to get started
        </Text>
      </View>
    </View>
  );
}
