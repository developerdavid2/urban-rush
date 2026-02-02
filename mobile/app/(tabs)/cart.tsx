import {
  View,
  Text,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import React, { useState, useEffect } from "react";
import SafeScreen from "@/components/safe-screen";
import useCart from "@/hooks/useCart";
import { ScrollView } from "react-native-gesture-handler";
import { useAddresses } from "@/hooks/useAddresses";
import { Address, Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { cn } from "@/lib/utils";
import OrderSummary from "@/components/orders/order-summary";

const CartTabScreen = () => {
  const {
    cart,
    cartTotal,
    addToCart,
    isAddingToCart,
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

  const { addresses } = useAddresses();

  // Local state for each item's quantity + tracking which items changed
  const [localQuantities, setLocalQuantities] = useState<
    Record<string, number>
  >({});
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const cartItems = cart?.items;
  const subtotal = cartTotal;
  const shipping = 10.0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  // Sync local quantities when cart data loads/changes
  useEffect(() => {
    const initialQuantities: Record<string, number> = {};
    cartItems.forEach((item) => {
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

  // Reset updating state after mutation finishes
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

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty", [{ text: "OK" }]);
      return;
    }

    if (!addresses || addresses.length === 0) {
      Alert.alert(
        "No Address",
        "Please add a shipping address in your profile",
        [{ text: "OK" }]
      );
      return;
    }

    // Proceed to payment or address selection
    // ... your payment logic here
  };

  if (isLoading) return <LoadingUI />;
  if (isError || !cart) return <ErrorUI />;
  if (cartItems.length === 0) return <EmptyUI />;

  const isCartBusy = isAddingToCart || isUpdatingCart || isRemovingFromCart;

  return (
    <SafeScreen>
      <Text className="px-6 pb-5 text-text-primary text-3xl font-bold tracking-tight">
        Cart ({cartItems.length})
      </Text>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 240 }}
      >
        <View className="px-6 gap-y-4">
          {cartItems.map((item) => {
            const product = item.product;
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
                  {/* Image */}

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

                      {/* Quantity Controls */}
                      <View className="flex-row justify-between items-center">
                        <View className="mt-4">
                          <View className="flex-row items-center">
                            <TouchableOpacity
                              className="bg-surface rounded-full w-10 h-10 items-center justify-center"
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
                                    : "#FFFFFF"
                                }
                              />
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Remove Button */}
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

                  {/* Update Button - only shows when changed */}
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
                          <ActivityIndicator size="small" color="#fff" />
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
            <Ionicons name="cart" size={20} color="#1DB954" />
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
          <View className="py-2 flex-row items-center justify-center">
            {paymentLoading ? (
              <ActivityIndicator size="small" color="#121212" />
            ) : (
              <>
                <Text className="text-background font-bold text-lg mr-2">
                  Checkout
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#121212" />
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>
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
