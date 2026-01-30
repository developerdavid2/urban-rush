import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React from "react";
import SafeScreen from "@/components/safe-screen";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { PROFILE_MENU_ITEMS } from "@/constants";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const ProfileTabScreen = () => {
  const { signOut } = useAuth();
  const { user } = useUser();

  const handleMenuPress = (
    action: (typeof PROFILE_MENU_ITEMS)[number]["action"]
  ) => {
    if (action === "/profile") return;

    // router.push(action)
  };
  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        {/* HEADER */}
        <View className="px-6 pb-8">
          <View className="bg-surface rounded-3xl p-6">
            <View className="flex-row items-center">
              <View className="relative">
                <Image
                  source={user?.imageUrl}
                  style={{ width: 80, height: 80, borderRadius: 40 }}
                  transition={200}
                />
                <View className="absolute -bottom-1 -right-1 bg-primary rounded-full size-7 items-center justify-center border-2 border-surface">
                  <Ionicons name="checkmark" size={16} color="#121212" />
                </View>
              </View>

              <View className="flex-1 ml-4">
                <Text className="text-text-primary text-2xl font-bold mb-1">
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text className="text-text-secondary text-sm">
                  {user?.emailAddresses[0].emailAddress}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* MENU ITEMS */}
        <View className="flex-row flex-wrap gap-2 mx-6 mb-3">
          {PROFILE_MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="bg-surface rounded-2xl p-6 items-center justify-center"
              style={{ width: "48%" }}
              activeOpacity={0.7}
              onPress={() => handleMenuPress(item.action)}
            >
              <View
                className="rounded-full size-16 items-center justify-center mb-4"
                style={{ backgroundColor: item.color + "20" }}
              >
                <Ionicons name={item.icon} size={28} color={item.color} />
              </View>
              <Text className="text-text-primary font-bold text-base">
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* NOTIFICATIONS  */}
        <View className="mb-3 mx-6 bg-surface rounded-2xl p-4">
          <TouchableOpacity
            className="flex-row items-center  justify-between py-2"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#FFFFFF"
              />
              <Text className="text-text-primary font-semibold ml-3">
                Notifications
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* PRIVACY AND SECURITY LINK */}
        <View className="mb-3 mx-6 bg-surface rounded-2xl p-4">
          <TouchableOpacity
            className="flex-row items-center  justify-between py-2"
            activeOpacity={0.7}
            // onPress={() => router.push("/privacy-security")}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#FFFFFF"
              />
              <Text className="text-text-primary font-semibold ml-3">
                Privacy & Security
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* SIGN OUT BUTTON */}
        <TouchableOpacity
          className="mx-6 mb-3 rounded-2xl py-5 flex-row items-center justify-center border-2 border-red-500/20"
          activeOpacity={0.8}
          onPress={() => signOut()}
        >
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text className="text-red-500 font-bold text-base ml-2">
            Sign Out
          </Text>
        </TouchableOpacity>

        <Text className="mx-6 mb-3 text-center text-text-secondary text-xs">
          Version 1.0.0
        </Text>
      </ScrollView>
    </SafeScreen>
  );
};

export default ProfileTabScreen;
