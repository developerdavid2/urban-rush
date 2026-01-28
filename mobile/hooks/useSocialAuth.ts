import { useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";

export type Strategy = "oauth_google" | "oauth_apple";

function useSocialAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { startSSOFlow } = useSSO();
  const [strategy, setStrategy] = useState<Strategy | null>(null);

  const handleSocialAuth = async (strategy: Strategy) => {
    setIsLoading(true);
    setStrategy(strategy);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      }
    } catch (error) {
      console.error("Error in social auth", error);
      const provider = strategy === "oauth_google" ? "Google" : "Apple";

      Alert.alert(
        "Error",
        `Failed to sign in with ${provider}. Please try again`
      );
    } finally {
      setIsLoading(false);
      setStrategy(null); // ✅ Reset strategy when done
    }
  };

  return { isLoading, handleSocialAuth, strategy };
}

export default useSocialAuth;
