import "react-native-reanimated";
import React from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
// import { EvaIconsPack } from "@ui-kitten/eva-icons";
import { LucideIconsPack } from "@/utils/Icons/lucide-icons"
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useColorScheme } from "@/hooks/useColorScheme";
import mainTheme from "@/assets/themes/main-theme.json";

import { ClerkProvider } from "@clerk/clerk-expo";
// import { passkeys } from "@clerk/expo-passkeys";
import { tokenCache } from "../utils/cache";
import blueTheme from "@/assets/themes/blueTheme.json";
import redTheme from "@/assets/themes/redTheme.json";
import Toast from "react-native-toast-message";
import { registerForPushNotificationsAsync } from "@/utils/Notifications";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const token = registerForPushNotificationsAsync().catch((err) => {
      console.log("Push notification registration error:", err);
    });
    console.log("Push notification token:", token);
  }, []);

  if (!loaded) {
    return null;
  }

  const theme = { ...eva.light, ...mainTheme };

  return (
    <>
    <IconRegistry icons={LucideIconsPack}/>
    <ApplicationProvider
        {...eva}
        theme={theme}
      >
      <ThemeProvider
          value={DefaultTheme}
      >
        <ClerkProvider
          publishableKey={publishableKey}
          tokenCache={tokenCache}
          // __experimental_passkeys={passkeys}
        >
          <Stack
            screenOptions={{
              headerShown: false,
              navigationBarHidden: true,
              statusBarHidden: false,
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(main)/" />
            <Stack.Screen name="(seller-registration)" />
            <Stack.Screen
              name="+not-found"
              options={{ headerShown: true, title: "Not Found" }}
            />
          </Stack>
          <StatusBar style="auto" />
        </ClerkProvider>
      </ThemeProvider>
    </ApplicationProvider>
    <Toast position="top"/>
    </>
  );
};

export default RootLayout;
