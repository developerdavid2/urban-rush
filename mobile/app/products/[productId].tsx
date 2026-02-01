import SafeScreen from "@/components/safe-screen";
import useCart from "@/hooks/useCart";
import useProduct from "@/hooks/useProduct";
import useWishlist from "@/hooks/useWishlist";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { cn } from "@/lib/utils";

const { width } = Dimensions.get("window");

type ButtonIcon = "cart" | "refresh" | "eye";

const ProductId = () => {
  const params = useLocalSearchParams<{ productId?: string | string[] }>();
  const productId = Array.isArray(params.productId)
    ? params.productId[0]
    : params.productId;
  const { product, isError, isLoading } = useProduct(productId);

  const {
    addToCart,
    updateCartItem,
    isAddingToCart,
    isUpdatingCart,
    isInCart,
    getCartItemQuantity,
    hasQuantityChanged,
  } = useCart();

  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Sync quantity with cart on mount
  useEffect(() => {
    if (!productId) return;
    if (isInCart(productId)) {
      setQuantity(getCartItemQuantity(productId));
    } else {
      setQuantity(1);
    }
  }, [getCartItemQuantity, isInCart, productId]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ productId: product._id, quantity });
  };

  const handleUpdateCart = () => {
    if (!product) return;
    updateCartItem({ productId: product._id, quantity });
  };

  if (!productId || isLoading) return <LoadingUI />;
  if (isError || !product) return <ErrorUI />;

  const inStock = product.stock > 0;

  const quantityChanged = hasQuantityChanged(product._id, quantity);

  // Button logic
  let buttonText = "Add to Cart";
  let buttonColor = "bg-primary";
  let buttonIcon: ButtonIcon = "cart";
  let onButtonPress = handleAddToCart;
  let disabled = !inStock || isAddingToCart;

  if (inStock && isInCart(product._id)) {
    if (quantityChanged) {
      buttonText = "Update Cart";
      buttonColor = "bg-orange-500";
      buttonIcon = "refresh";
      onButtonPress = handleUpdateCart;
      disabled = isUpdatingCart;
    } else {
      buttonText = "View Cart";
      buttonColor = "bg-green-500";
      buttonIcon = "eye";
      onButtonPress = () => router.push("/(tabs)/cart");
      disabled = false;
    }
  }

  return (
    <SafeScreen>
      {/* HEADER */}
      <View className="absolute top-0 left-0 right-0 z-10 px-6 pt-20 pb-4 flex-row items-center justify-between">
        <TouchableOpacity
          className="bg-black/50 backdrop-blur-xl w-12 h-12 rounded-full items-center justify-center"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          className={cn(
            "w-12 h-12 rounded-full items-center justify-center",
            isInWishlist(product._id)
              ? "bg-primary/20"
              : "bg-black/50 backdrop-blur-xl"
          )}
          onPress={() => toggleWishlist(product._id, product)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isInWishlist(product._id) ? "heart" : "heart-outline"}
            size={24}
            color={isInWishlist(product._id) ? "#FF6B6B" : "#FFFFFF"}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
      >
        {/* IMAGE GALLERY */}
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {product.images.map((image: string, index: number) => (
              <View key={index} style={{ width }}>
                <Image
                  source={image}
                  style={{ width, height: 350 }}
                  contentFit="cover"
                />
              </View>
            ))}
          </ScrollView>

          {/* Indicators */}
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
            {product.images.map((_, index) => (
              <View
                key={index}
                className={`h-2 rounded-full ${
                  index === selectedImageIndex
                    ? "bg-primary w-6"
                    : "bg-white/50 w-2"
                }`}
              />
            ))}
          </View>
        </View>

        {/* PRODUCT INFO */}
        <View className="p-6">
          <View className="flex-row items-center mb-3">
            <View className="bg-primary/20 px-3 py-1 rounded-full">
              <Text className="text-primary text-xs font-bold">
                {product.category}
              </Text>
            </View>
          </View>

          <Text className="text-text-primary text-3xl font-bold mb-3">
            {product.name}
          </Text>

          <View className="flex-row items-center mb-6">
            <Ionicons name="star" size={16} color="#FFC107" />
            <Text className="text-text-primary font-bold ml-1">
              {product.ratingsAverage.toFixed(1)}
            </Text>
            <Text className="text-text-secondary text-sm ml-2">
              ({product.ratingsQuantity} reviews)
            </Text>
          </View>

          <Text className="text-primary text-4xl font-bold mb-6">
            ${product.price.toFixed(2)}
          </Text>

          {inStock && (
            <View className="mb-8">
              <Text className="text-text-primary text-lg font-bold mb-3">
                Quantity
              </Text>

              <View className="flex-row items-center">
                <TouchableOpacity
                  className="bg-surface rounded-full w-12 h-12 items-center justify-center"
                  onPress={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1 || isUpdatingCart}
                >
                  <Ionicons
                    name="remove"
                    size={24}
                    color={quantity <= 1 || isUpdatingCart ? "#444" : "#FFFFFF"}
                  />
                </TouchableOpacity>

                <Text className="text-text-primary text-2xl font-bold mx-8">
                  {quantity}
                </Text>

                <TouchableOpacity
                  className="bg-primary rounded-full w-12 h-12 items-center justify-center"
                  onPress={() => setQuantity((prev) => prev + 1)}
                  disabled={quantity >= product.stock || isUpdatingCart}
                >
                  <Ionicons
                    name="add"
                    size={24}
                    color={
                      quantity >= product.stock || isUpdatingCart
                        ? "#666"
                        : "#121212"
                    }
                  />
                </TouchableOpacity>
              </View>

              {quantity >= product.stock && (
                <Text className="text-orange-500 text-sm mt-2">
                  Maximum available stock reached
                </Text>
              )}

              {isUpdatingCart && (
                <View className="flex-row items-center mt-3">
                  <ActivityIndicator size="small" color="#10b981" />
                  <Text className="text-emerald-500 ml-2">
                    Updating cart...
                  </Text>
                </View>
              )}
            </View>
          )}

          <View className="mb-8">
            <Text className="text-text-primary text-lg font-bold mb-3">
              Summary
            </Text>
            <Text className="text-text-secondary text-base leading-6">
              {product.summary}
            </Text>
          </View>

          <View className="mb-8">
            <Text className="text-text-primary text-lg font-bold mb-3">
              Description
            </Text>
            <Text className="text-text-secondary text-base leading-6">
              {product.description}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl border-t border-surface px-6 py-4 pb-8">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-text-secondary text-sm">Total</Text>
            <Text className="text-primary text-2xl font-bold">
              ${(product.price * quantity).toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            className={cn(
              "rounded-2xl px-8 py-4 flex-row items-center",
              buttonColor,
              disabled && "opacity-60"
            )}
            activeOpacity={0.8}
            onPress={onButtonPress}
            disabled={disabled}
          >
            <Ionicons name={buttonIcon} size={24} color="#121212" />
            <Text className="text-background font-bold text-lg ml-2">
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeScreen>
  );
};

export default ProductId;

function ErrorUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text className="text-text-primary font-semibold text-xl mt-4">
          Product not found
        </Text>
        <Text className="text-text-secondary text-center mt-2">
          This product may have been removed or doesn&apos;t exist
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-2xl px-6 py-3 mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-background font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

function LoadingUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#1DB954" />
        <Text className="text-text-secondary mt-4">Loading product...</Text>
      </View>
    </SafeScreen>
  );
}
