import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl, // ✅ Import this
} from "react-native";
import React, { useState } from "react";
import SafeScreen from "@/components/safe-screen";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import useWishlist from "@/hooks/useWishlist";
import useCart from "@/hooks/useCart";
import { Product } from "@/types";
import { Image } from "expo-image";

const Wishlist = () => {
  const { wishlist, isLoading, isError, removeFromWishlist, refetch } =
    useWishlist(); // ✅ Get refetch from hook
  const { addToCart, canAddToCart, isInCart, getCartItemQuantity } = useCart();

  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false); // ✅ Add refreshing state

  // ✅ Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch(); // Refetch wishlist data
    setRefreshing(false);
  };

  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    Alert.alert("Remove from wishlist", `Remove ${productName} from wishlist`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeFromWishlist(productId),
      },
    ]);
  };

  const handleAddToCart = (product: Product) => {
    if (!canAddToCart(product._id, product)) {
      return;
    }

    setLoadingProductId(product._id);
    addToCart(product._id, 1, product);

    setTimeout(() => setLoadingProductId(null), 500);
  };

  if (isLoading) return <LoadingUI />;
  if (isError) return <ErrorUI />;

  return (
    <SafeScreen>
      {/* HEADER */}
      <View className="px-6 pb-5 border-b border-surface flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-text-primary text-2xl font-bold">Wishlist</Text>
        <Text className="text-text-secondary text-sm ml-auto">
          {wishlist.length} {wishlist.length === 1 ? "item" : "items"}
        </Text>
      </View>

      {wishlist.length === 0 ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flex: 1 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00D9FF" // Spinner color (iOS)
              colors={["#00D9FF"]} // Spinner color (Android)
            />
          }
        >
          <View className="flex-1 items-center justify-center px-6">
            <Ionicons name="heart-outline" size={80} color="#666" />
            <Text className="text-text-primary font-semibold text-xl mt-4">
              Your wishlist is empty
            </Text>
            <Text className="text-text-secondary text-center mt-2">
              Start adding products you love!
            </Text>

            <TouchableOpacity
              className="bg-primary rounded-2xl px-8 py-4 mt-6"
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)")}
            >
              <Text className="text-background font-bold text-base">
                Browse Products
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 150 }}
          refreshControl={
            // ✅ Add RefreshControl here
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00D9FF" // iOS spinner color
              colors={["#00D9FF"]} // Android spinner colors
            />
          }
        >
          <View className="px-6 py-4">
            {wishlist.map((item) => {
              const inCart = isInCart(item._id);
              const cartQuantity = getCartItemQuantity(item._id);
              const canAdd = canAddToCart(item._id, item);
              const isOutOfStock = item.stock === 0;
              const isLowStock = item.stock > 0 && item.stock <= 5;
              const isLoadingThis = loadingProductId === item._id;

              return (
                <TouchableOpacity
                  key={item._id}
                  className="bg-surface rounded-3xl overflow-hidden mb-3"
                  activeOpacity={0.8}
                  //   onPress={() => router.push(`/products/${item._id}`)}
                >
                  <View className="flex-row p-4">
                    <View className="relative">
                      <Image
                        source={item.images[0]}
                        className="rounded-2xl bg-background-lighter"
                        style={{ width: 96, height: 96, borderRadius: 8 }}
                      />
                      {isOutOfStock && (
                        <View className="absolute bottom-2 left-2 bg-red-500 px-2 py-1 rounded-full">
                          <Text className="text-white text-xs font-semibold">
                            Out
                          </Text>
                        </View>
                      )}
                      {isLowStock && !inCart && (
                        <View className="absolute bottom-2 left-2 bg-orange-500 px-2 py-1 rounded-full">
                          <Text className="text-white text-xs font-semibold">
                            {item.stock} left
                          </Text>
                        </View>
                      )}
                    </View>

                    <View className="flex-1 ml-4">
                      <Text
                        className="text-text-primary font-bold text-base mb-2"
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                      <Text className="text-primary font-bold text-xl mb-2">
                        ${item.price.toFixed(2)}
                      </Text>

                      {isOutOfStock ? (
                        <View className="flex-row items-center">
                          <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                          <Text className="text-red-500 text-sm font-semibold">
                            Out of Stock
                          </Text>
                        </View>
                      ) : isLowStock ? (
                        <View className="flex-row items-center">
                          <View className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                          <Text className="text-orange-500 text-sm font-semibold">
                            Only {item.stock} left
                          </Text>
                        </View>
                      ) : (
                        <View className="flex-row items-center">
                          <View className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          <Text className="text-green-500 text-sm font-semibold">
                            In Stock
                          </Text>
                        </View>
                      )}

                      {inCart && (
                        <View className="flex-row items-center mt-1">
                          <Ionicons name="cart" size={14} color="#10B981" />
                          <Text className="text-green-500 text-sm font-semibold ml-1">
                            {cartQuantity} in cart
                          </Text>
                        </View>
                      )}
                    </View>

                    <TouchableOpacity
                      className="self-start bg-red-500/20 p-2 rounded-full"
                      activeOpacity={0.7}
                      onPress={() =>
                        handleRemoveFromWishlist(item._id, item.name)
                      }
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#EF4444"
                      />
                    </TouchableOpacity>
                  </View>

                  <View className="px-4 pb-4">
                    {isOutOfStock ? (
                      <TouchableOpacity
                        className="bg-gray-500 rounded-xl py-3 items-center"
                        activeOpacity={0.8}
                        disabled
                      >
                        <View className="flex-row items-center">
                          <Ionicons
                            name="close-circle"
                            size={18}
                            color="#121212"
                          />
                          <Text className="text-background font-bold ml-2">
                            Out of Stock
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : inCart && !canAdd ? (
                      <TouchableOpacity
                        className="bg-orange-500 rounded-xl py-3 items-center"
                        activeOpacity={0.8}
                        disabled
                      >
                        <View className="flex-row items-center">
                          <Ionicons
                            name="alert-circle"
                            size={18}
                            color="#121212"
                          />
                          <Text className="text-background font-bold ml-2">
                            Max in Cart
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : inCart ? (
                      <TouchableOpacity
                        className="bg-green-500 rounded-xl py-3 items-center"
                        activeOpacity={0.8}
                        onPress={() => router.push("/(tabs)/cart")}
                      >
                        <View className="flex-row items-center">
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#121212"
                          />
                          <Text className="text-background font-bold ml-2">
                            View in Cart
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        className="bg-primary rounded-xl py-3 items-center"
                        activeOpacity={0.8}
                        onPress={() => handleAddToCart(item)}
                        disabled={isLoadingThis || !canAdd}
                      >
                        {isLoadingThis ? (
                          <ActivityIndicator size="small" color="#121212" />
                        ) : (
                          <View className="flex-row items-center">
                            <Ionicons name="cart" size={18} color="#121212" />
                            <Text className="text-background font-bold ml-2">
                              Add to Cart
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeScreen>
  );
};

export default Wishlist;

function LoadingUI() {
  return (
    <SafeScreen>
      <View className="px-6 pb-5 border-b border-surface flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-text-primary text-2xl font-bold">Wishlist</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#00D9FF" />
        <Text className="text-text-secondary mt-4">Loading wishlist...</Text>
      </View>
    </SafeScreen>
  );
}

function ErrorUI() {
  return (
    <SafeScreen>
      <View className="px-6 pb-5 border-b border-surface flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text className="text-text-primary text-2xl font-bold">Wishlist</Text>
      </View>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={80} color="#FF6B6B" />
        <Text className="text-text-primary font-semibold text-xl mt-4">
          Failed to load wishlist
        </Text>
        <Text className="text-text-secondary text-center mt-2">
          Please try again later
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-2xl px-8 py-4 mt-6"
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Text className="text-background font-bold text-base">Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}
