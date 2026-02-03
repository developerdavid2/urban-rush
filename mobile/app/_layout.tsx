import { Stack } from "expo-router";
import "../global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ClerkLoaded, ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toasts } from "@backpackapp-io/react-native-toast";
import { StripeProvider } from "@stripe/stripe-react-native";
import { PortalProvider } from "@gorhom/portal"; // ✅ ADD THIS

const queryClient = new QueryClient();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    "Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env"
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <QueryClientProvider client={queryClient}>
            <StripeProvider
              publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
            >
              <GestureHandlerRootView style={{ flex: 1 }}>
                {/* ✅ WRAP WITH PORTAL PROVIDER */}
                <PortalProvider>
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      animation: "slide_from_right",
                    }}
                  />
                  <Toasts
                    defaultStyle={{
                      view: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        borderRadius: 8,
                      },
                      text: {
                        color: "white",
                      },
                      indicator: {
                        marginRight: 16,
                      },
                    }}
                  />
                </PortalProvider>
              </GestureHandlerRootView>
            </StripeProvider>
          </QueryClientProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}
