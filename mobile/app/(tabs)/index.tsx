import ProductsGrid from "@/components/products/products-grid";
import SafeScreen from "@/components/safe-screen";
import { CATEGORIES } from "@/constants";
import useProducts from "@/hooks/useProducts";
import { Product } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ShopTabScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const {
    products: productsResponse,
    isLoading,
    isError,
    refetch,
  } = useProducts();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  };

  const products: Product[] = productsResponse?.data;

  const filteredProducts = useMemo(() => {
    if (!products) return;

    let filtered = products;

    if (selectedCategory !== "All") {
      filtered = filtered.filter(
        (product) =>
          product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, searchQuery, selectedCategory]);

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]} // ✅ Makes the first child (header) sticky
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1AA34A"
            colors={["#1AA34A"]}
          />
        }
      >
        {/* ✅ STICKY HEADER - Now inside ScrollView but stays fixed */}
        <View className="bg-background px-6 pb-4 pt-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-white text-3xl font-bold tracking-tight">
                Shop
              </Text>
              <Text className="text-text-secondary text-sm mt-1">
                Browse all products
              </Text>
            </View>

            <TouchableOpacity
              className="bg-surface/50 p-3 rounded-full"
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* SEARCH BAR */}
          <View className="bg-surface flex-row items-center px-5 py-2 rounded-2xl">
            <Ionicons color="#666" size={22} name="search" />
            <TextInput
              placeholder="Search for products"
              placeholderTextColor="#666"
              className="flex-1 ml-3 text-base text-emerald-500"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* ✅ SCROLLABLE CONTENT */}
        <View>
          {/* CATEGORY FILTER */}
          <View className="mb-6 max-w-[370px] mx-auto">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 20,
              }}
            >
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category.name;

                return (
                  <TouchableOpacity
                    key={category.name}
                    onPress={() => setSelectedCategory(category.name)}
                    activeOpacity={0.5}
                    className={`mr-3 rounded-2xl size-20 overflow-hidden items-center justify-center ${isSelected ? "bg-emerald-500" : "bg-surface"}`}
                  >
                    {category.icon ? (
                      <Ionicons
                        name={category.icon}
                        size={36}
                        color={isSelected ? "#000" : "#fff"}
                      />
                    ) : (
                      <Image
                        source={category.image}
                        className="size-12"
                        resizeMode="contain"
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <View className="px-6 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-emerald-500 text-lg font-bold">
                Products
              </Text>
              <Text className="text-text-secondary text-sm">
                {filteredProducts?.length} items
              </Text>
            </View>

            {/* PRODUCT GRID */}
            <ProductsGrid
              products={filteredProducts ?? []}
              isLoading={isLoading}
              isError={isError}
            />
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default ShopTabScreen;
