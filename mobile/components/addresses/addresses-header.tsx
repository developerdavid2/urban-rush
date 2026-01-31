import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const AddressesHeader = () => {
  return (
    <View className="px-6 pb-6 border-b border-surface flex-row items-center">
      <TouchableOpacity onPress={() => router.back()} className="mr-4">
        <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
      </TouchableOpacity>
      <Text className="text-text-primary text-2xl font-bold">My Addresses</Text>
    </View>
  );
};

export default AddressesHeader;
