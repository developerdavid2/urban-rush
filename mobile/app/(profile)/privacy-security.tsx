import { View, Text, TouchableOpacity, ScrollView, Switch } from "react-native";
import React, { useState } from "react";
import SafeScreen from "@/components/safe-screen";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getSecuritySettings,
  getPrivacySettings,
  accountSettings,
} from "@/constants";

const PrivacySecurity = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [shareData, setShareData] = useState(false);

  const securitySettings = getSecuritySettings(
    twoFactorEnabled,
    biometricEnabled
  );
  const privacySettings = getPrivacySettings(
    pushNotifications,
    emailNotifications,
    marketingEmails,
    shareData
  );

  const handleToggle = (id: string, value: boolean) => {
    switch (id) {
      case "two-factor":
        setTwoFactorEnabled(value);
        break;
      case "biometric":
        setBiometricEnabled(value);
        break;
      case "push":
        setPushNotifications(value);
        break;
      case "email":
        setEmailNotifications(value);
        break;
      case "marketing":
        setMarketingEmails(value);
        break;
      case "data":
        setShareData(value);
        break;
    }
  };

  return (
    <SafeScreen>
      {/* HEADER */}
      <View className="px-6 pb-5 border-b border-surface flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text className="text-text-primary text-2xl font-bold">
          Privacy & Security
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
      >
        {/* SECURITY SECTION */}
        <View className="px-6 py-4">
          <Text className="text-text-primary text-lg font-bold mb-4">
            Security
          </Text>
          {securitySettings.map((setting) => (
            <TouchableOpacity
              key={setting.id}
              className="bg-surface rounded-2xl p-4 mb-3 flex-row items-center"
              activeOpacity={setting.type === "toggle" ? 1 : 0.7}
            >
              <View className="bg-primary/10 p-3 rounded-full mr-4">
                <Ionicons
                  name={setting.icon as any}
                  size={24}
                  color="#1db954"
                />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold text-base">
                  {setting.title}
                </Text>
                <Text className="text-text-secondary text-sm mt-1">
                  {setting.description}
                </Text>
              </View>

              {setting.type === "toggle" ? (
                <Switch
                  value={setting.value}
                  onValueChange={(value) => handleToggle(setting.id, value)}
                  trackColor={{ false: "#3e3e3e", true: "#1db954" }}
                  thumbColor="#FFFFFF"
                />
              ) : (
                <Ionicons name="chevron-forward" size={20} color="#666" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* PRIVACY SECTION */}
        <View className="px-6 py-4">
          <Text className="text-text-primary text-lg font-bold mb-4">
            Privacy
          </Text>
          {privacySettings.map((setting) => (
            <View
              key={setting.id}
              className="bg-surface rounded-2xl p-4 mb-3 flex-row items-center"
            >
              <View className="bg-primary/10 p-3 rounded-full mr-4">
                <Ionicons
                  name={setting.icon as any}
                  size={24}
                  color="#1db954"
                />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold text-base">
                  {setting.title}
                </Text>
                <Text className="text-text-secondary text-sm mt-1">
                  {setting.description}
                </Text>
              </View>
              <Switch
                value={setting.value}
                onValueChange={(value) => handleToggle(setting.id, value)}
                trackColor={{ false: "#3e3e3e", true: "#1db954" }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        {/* ACCOUNT SECTION */}
        <View className="px-6 py-4">
          <Text className="text-text-primary text-lg font-bold mb-4">
            Account
          </Text>
          {accountSettings.map((setting) => (
            <TouchableOpacity
              key={setting.id}
              className="bg-surface rounded-2xl p-4 mb-3 flex-row items-center"
              activeOpacity={0.7}
            >
              <View className="bg-primary/10 p-3 rounded-full mr-4">
                <Ionicons
                  name={setting.icon as any}
                  size={24}
                  color="#1db954"
                />
              </View>
              <View className="flex-1">
                <Text className="text-text-primary font-semibold text-base">
                  {setting.title}
                </Text>
                <Text className="text-text-secondary text-sm mt-1">
                  {setting.description}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* DELETE ACCOUNT  */}
        <View className="px-6 pt-4">
          <TouchableOpacity
            className="bg-surface rounded-2xl p-5 flex-row items-center justify-between border-2 border-red-500/20"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <View className="bg-red-500/20 rounded-full w-12 h-12 items-center justify-center mr-4">
                <Ionicons name="trash-outline" size={24} color="#EF4444" />
              </View>
              <View>
                <Text className="text-red-500 font-bold text-base mb-1">
                  Delete Account
                </Text>
                <Text className="text-text-secondary text-sm">
                  Permanently delete your account
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* INFO ALERT */}
        <View className="px-6 pt-6 pb-4">
          <View className="bg-primary/10 rounded-2xl p-4 flex-row">
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#1DB954"
            />
            <Text className="text-text-secondary text-sm ml-3 flex-1">
              We take your privacy seriously. Your data is encrypted and stored
              securely. You can manage your privacy settings at any time.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default PrivacySecurity;
