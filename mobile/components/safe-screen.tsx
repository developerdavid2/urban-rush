import { View, Text } from "react-native";
import React from "react";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const SafeScreen = ({ children }: { children: React.ReactNode }) => {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      {children}
    </SafeAreaView>
  );
};

export default SafeScreen;
