import { images } from "@/constants";
import useSocialAuth from "@/hooks/useSocialAuth";
import React from "react";
import {
  ActivityIndicator,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const AuthScreen = () => {
  const { isLoading, handleSocialAuth, strategy } = useSocialAuth();

  return (
    <View className="flex-1 justify-center items-center px-6">
      <View className="w-full max-w-sm">
        <Image
          source={images.authImage}
          className="size-96 mx-auto"
          resizeMode="contain"
        />

        <View className="gap-2 mt-3">
          {/* GOOGLE SIGN IN BUTTON */}
          <TouchableOpacity
            className="rounded-full px-16 py-3 flex flex-row border border-gray-300"
            onPress={() => handleSocialAuth("oauth_google")}
            disabled={isLoading}
            style={{
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              minHeight: 58,
            }}
          >
            <View className="flex-row items-center justify-center gap-2 w-full">
              {strategy === "oauth_google" && isLoading ? (
                <View className="size-10 items-center justify-center">
                  <ActivityIndicator size="small" color="#4285f4" />
                </View>
              ) : (
                <Image
                  source={images.googleIcon}
                  className="size-10"
                  resizeMode="contain"
                />
              )}
              <Text className="text-black font-medium text-base">
                {strategy === "oauth_google" && isLoading
                  ? "Signing in..."
                  : "Continue with Google"}
              </Text>
            </View>
          </TouchableOpacity>

          {/* APPLE SIGN IN BUTTON */}
          <TouchableOpacity
            className="rounded-full px-16 py-3 flex flex-row border border-gray-300"
            onPress={() => handleSocialAuth("oauth_apple")}
            disabled={isLoading}
            style={{
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.1,
              minHeight: 58,
            }}
          >
            <View className="flex-row items-center justify-center gap-2 w-full">
              {strategy === "oauth_apple" && isLoading ? (
                <View className="size-10 items-center justify-center">
                  <ActivityIndicator size="small" color="#000000" />
                </View>
              ) : (
                <Image
                  source={images.appleIcon}
                  className="size-10"
                  resizeMode="contain"
                />
              )}
              <Text className="text-black font-medium text-base">
                {strategy === "oauth_apple" && isLoading
                  ? "Signing in..."
                  : "Continue with Apple"}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-gray-500 text-xs leading-4 mt-4 px-2">
          By signing up, you agree to our{" "}
          <Text className="text-blue-500">Terms</Text>,{" "}
          <Text className="text-blue-500">Privacy Policy</Text> and{" "}
          <Text className="text-blue-500">Cookie Use</Text>
        </Text>
      </View>
    </View>
  );
};

export default AuthScreen;
