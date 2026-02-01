import { View, Text } from "react-native";
import React from "react";
import SafeScreen from "@/components/safe-screen";
import useCart from "@/hooks/useCart";
import { ScrollView } from "react-native-gesture-handler";

const CartTabScreen = () => {
  const { cart, isLoading, isError } = useCart();
  return (
    <SafeScreen>
      <ScrollView>
        <Text className="text-white">CartTabScreen</Text>
        <Text className="text-white">{JSON.stringify(cart, null, 2)}</Text>
      </ScrollView>
    </SafeScreen>
  );
};

export default CartTabScreen;
