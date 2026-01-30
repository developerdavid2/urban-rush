import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { Product } from "@/types";
import useWishlist from "@/hooks/useWishlist";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import useCart from "@/hooks/useCart";

interface ProductsGridProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
}

const ProductsGrid = ({ products, isLoading, isError }: ProductsGridProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart, isInCart, canAddToCart, getCartItemQuantity } = useCart();

  const handleToggleWishlist = (product: Product) => {
    toggleWishlist(product._id, product);
  };

  const handleAddToCart = (product: Product) => {
    // ✅ Check if can add before attempting
    if (!canAddToCart(product._id, product)) {
      // This shouldn't happen as button is disabled, but just in case
      return;
    }
    addToCart(product._id, 1, product);
  };

  const renderProduct = ({ item: product }: { item: Product }) => {
    const inWishlist = isInWishlist(product._id);
    const inCartAlready = isInCart(product._id);
    const cartQuantity = getCartItemQuantity(product._id);
    const canAdd = canAddToCart(product._id, product);
    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;

    return (
      <TouchableOpacity
        className="bg-surface rounded-3xl overflow-hidden mb-3"
        style={{ width: "48%" }}
        activeOpacity={0.8}
        // onPress={() => router.push(`/products/${product._id}`)}
      >
        <View className="relative">
          <Image
            source={{ uri: product.images?.[0] }}
            className="w-full h-44 bg-background-lighter"
            resizeMode="cover"
          />

          {/* ✅ Stock Badge */}
          {isOutOfStock && (
            <View className="absolute top-3 left-3 bg-red-500 px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">
                Out of Stock
              </Text>
            </View>
          )}
          {isLowStock && !inCartAlready && (
            <View className="absolute top-3 left-3 bg-orange-500 px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-semibold">
                Only {product.stock} left
              </Text>
            </View>
          )}

          {/* Wishlist Button */}
          <TouchableOpacity
            className="absolute top-3 right-3 bg-black/30 backdrop-blur-xl p-2 rounded-full"
            activeOpacity={0.7}
            onPress={() => handleToggleWishlist(product)}
          >
            <Ionicons
              name={inWishlist ? "heart" : "heart-outline"}
              size={18}
              color={inWishlist ? "#FF6B6B" : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>

        <View className="p-3">
          <Text className="text-text-secondary text-xs mb-1">
            {product.category}
          </Text>
          <Text
            className="text-text-primary font-bold text-sm mb-2"
            numberOfLines={2}
          >
            {product.name}
          </Text>

          <View className="flex-row items-center mb-2">
            <Ionicons name="star" size={12} color="#FFC107" />
            <Text className="text-text-primary text-xs font-semibold ml-1">
              {product.ratingsAverage.toFixed(1)}
            </Text>
            <Text className="text-text-secondary text-xs ml-1">
              ({product.ratingsQuantity})
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-primary font-bold text-lg">
              ${product.price.toFixed(2)}
            </Text>

            {/* ✅ Smart Add to Cart Button */}
            <TouchableOpacity
              className={`rounded-full w-8 h-8 items-center justify-center ${
                isOutOfStock
                  ? "bg-gray-500"
                  : inCartAlready
                    ? "bg-green-500"
                    : canAdd
                      ? "bg-primary"
                      : "bg-orange-500"
              }`}
              activeOpacity={0.7}
              onPress={() => handleAddToCart(product)}
              disabled={isOutOfStock || !canAdd}
            >
              <Ionicons
                name={
                  isOutOfStock
                    ? "close"
                    : inCartAlready
                      ? "checkmark"
                      : canAdd
                        ? "add"
                        : "alert"
                }
                size={18}
                color="#121212"
              />
            </TouchableOpacity>
          </View>

          {/* ✅ Show cart quantity if in cart */}
          {inCartAlready && (
            <Text className="text-green-500 text-xs mt-1 text-center font-semibold">
              {cartQuantity} in cart
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View className="py-20 items-center justify-center">
        <ActivityIndicator size="large" color="#00D9FF" />
        <Text className="text-text-secondary mt-4">Loading products...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="py-20 items-center justify-center">
        <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
        <Text className="text-text-primary font-semibold mt-4">
          Failed to load products
        </Text>
        <Text className="text-text-secondary text-sm mt-2">
          Please try again later
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={{
        justifyContent: "space-between",
        paddingHorizontal: 16,
      }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      ListEmptyComponent={NoProductsFound}
    />
  );
};

export default ProductsGrid;

function NoProductsFound() {
  return (
    <View className="py-20 items-center justify-center">
      <Ionicons name="search-outline" size={48} color="#666" />
      <Text className="text-text-primary font-semibold mt-4">
        No Products found
      </Text>
      <Text className="text-text-secondary text-sm mt-2">
        Try adjusting your filters
      </Text>
    </View>
  );
}
