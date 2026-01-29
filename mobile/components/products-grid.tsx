import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import React, { useState } from "react";
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
  const { addToCart } = useCart();

  // ✅ Only track cart loading, NOT wishlist
  const [loadingCart, setLoadingCart] = useState<string | null>(null);

  // ✅ Fire and forget - no loading state needed
  const handleToggleWishlist = (product: Product) => {
    toggleWishlist(product._id, product);
  };

  const handleAddToCart = async (productId: string) => {
    setLoadingCart(productId);
    try {
      await addToCart({ productId, quantity: 1 });
    } finally {
      setLoadingCart(null);
    }
  };

  const renderProduct = ({ item: product }: { item: Product }) => {
    const isCartLoading = loadingCart === product._id;
    const inWishlist = isInWishlist(product._id);

    return (
      <TouchableOpacity
        className="bg-surface rounded-3xl overflow-hidden mb-3"
        style={{ width: "48%" }}
        activeOpacity={0.8}
        // onPress={() => router.push(`/products/${product._id}`)}
      >
        <View className="relative">
          <Image
            source={{ uri: product.images[0] }}
            className="w-full h-44 bg-background-lighter"
            resizeMode="cover"
          />

          {/* ✅ No loading state - instant toggle */}
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
            <TouchableOpacity
              className="bg-primary rounded-full w-8 h-8 items-center justify-center"
              activeOpacity={0.7}
              onPress={() => handleAddToCart(product._id)}
              disabled={isCartLoading}
            >
              {isCartLoading ? (
                <ActivityIndicator size="small" color="#121212" />
              ) : (
                <Ionicons name="add" size={18} color="#121212" />
              )}
            </TouchableOpacity>
          </View>
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
