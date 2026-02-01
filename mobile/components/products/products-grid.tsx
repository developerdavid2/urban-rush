import useCart from "@/hooks/useCart";
import useWishlist from "@/hooks/useWishlist";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ProductsGridProps {
  products: Product[];
  isLoading: boolean;
  isError: boolean;
}

const ProductsGrid = ({ products, isLoading, isError }: ProductsGridProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const {
    addToCart,
    isInCart,
    canAddToCart,
    getCartItemQuantity,
    isAddingToCart,
    isUpdatingCart,
  } = useCart();

  // Track which product is currently being added/updated (for per-button spinner)
  const [activeProductId, setActiveProductId] = React.useState<string | null>(
    null
  );

  const handleToggleWishlist = (product: Product) => {
    toggleWishlist(product._id, product);
  };

  const handleAddToCart = (product: Product) => {
    if (!canAddToCart(product._id, product)) return;

    // Mark this product as active
    setActiveProductId(product._id);

    addToCart({ productId: product._id, quantity: 1 });

    // Reset active state after operation (even on error)
    setTimeout(() => setActiveProductId(null), 3000); // safety fallback
  };

  // Listen to mutation states to reset active product
  React.useEffect(() => {
    if (!isAddingToCart && !isUpdatingCart && activeProductId) {
      setActiveProductId(null);
    }
  }, [isAddingToCart, isUpdatingCart, activeProductId]);

  const isCartBusy = isAddingToCart || isUpdatingCart;

  const renderProduct = ({ item: product }: { item: Product }) => {
    const inWishlist = isInWishlist(product._id);
    const inCartAlready = isInCart(product._id);
    const cartQuantity = getCartItemQuantity(product._id);
    const canAdd = canAddToCart(product._id, product);
    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;

    // Show spinner only on this product's button
    const isThisProductBusy = activeProductId === product._id;

    return (
      <TouchableOpacity
        className="bg-surface rounded-3xl overflow-hidden mb-3"
        style={{ width: "48%" }}
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: "/products/[productId]",
            params: { productId: product._id },
          })
        }
        disabled={isCartBusy} // ← Entire card disabled during any cart operation
      >
        <View className="relative">
          <Image
            source={{ uri: product.images?.[0] }}
            className="w-full h-44 bg-background-lighter"
            resizeMode="cover"
          />

          {/* Stock Badge */}
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
            disabled={isCartBusy}
          >
            <Ionicons
              name={inWishlist ? "heart" : "heart-outline"}
              size={18}
              color={inWishlist ? "#FF6B6B" : "#FFFFFF"}
            />
          </TouchableOpacity>
        </View>

        <View className="p-3">
          <Text className="text-text-secondary text-xs mb-1 capitalize">
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
            <Text className="text-emerald-500 font-bold text-lg">
              ${product.price.toFixed(2)}
            </Text>

            <TouchableOpacity
              className={`rounded-full w-8 h-8 items-center justify-center ${
                isOutOfStock
                  ? "bg-gray-500"
                  : inCartAlready
                    ? "bg-green-500"
                    : canAdd
                      ? "bg-emerald-500"
                      : "bg-orange-500"
              }`}
              activeOpacity={0.7}
              onPress={() => handleAddToCart(product)}
              disabled={isOutOfStock || !canAdd || isCartBusy} // ← Disable during any operation
            >
              {isThisProductBusy ? ( // ← Spinner only on this product's button
                <ActivityIndicator size="small" color="#121212" />
              ) : (
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
                  color="black"
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Show cart quantity if in cart */}
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
        <ActivityIndicator size="large" color="#1AA34A" />
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
        paddingHorizontal: 0,
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
