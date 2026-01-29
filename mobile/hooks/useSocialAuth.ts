import { useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";
import * as Linking from "expo-linking";

export type Strategy = "oauth_google" | "oauth_apple";

function useSocialAuth() {
  const { startSSOFlow } = useSSO();
  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);

  const handleSocialAuth = async (strategy: Strategy) => {
    setLoadingStrategy(strategy);

    try {
      // Create redirect URL
      const redirectUrl = Linking.createURL("/(auth)", { scheme: "mobile" });

      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl,
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      } else {
        Alert.alert(
          "Sign-in incomplete",
          "We couldn't complete sign-in. Please try again."
        );
      }
    } catch (error) {
      console.error("Error in social auth", error);
      const provider = strategy === "oauth_google" ? "Google" : "Apple";

      Alert.alert(
        "Error",
        `Failed to sign in with ${provider}. Please try again`
      );
    } finally {
      setLoadingStrategy(null);
    }
  };

  return { loadingStrategy, handleSocialAuth };
}

export default useSocialAuth;
