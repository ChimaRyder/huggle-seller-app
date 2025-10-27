import React, { useEffect, useState } from "react";
import { Alert, View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useUser, useAuth , useClerk } from "@clerk/clerk-expo";
import axios from "axios";
import { Text, Spinner, useTheme, Layout, Icon } from "@ui-kitten/components"; // Changed from react-native-svg for proper Text component
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { registerForPushNotificationsAsync } from "@/utils/Notifications";
import { addSellerPushToken } from "@/utils/api/pushToken";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AuthScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Checking user information...");
  const theme = useTheme();
  const { getToken } = useAuth();

  const registerAndFetchToken = async () => {
    try {
      console.log('📱 AuthScreen: Starting seller push token registration...');
      const pToken = await registerForPushNotificationsAsync();
      
      if (user && pToken) {
        console.log('📱 AuthScreen: Got push token, registering with backend...');
        const token = await getToken({ template: "seller_app" });
        const response = await addSellerPushToken(token ?? "", { token: pToken });
        
        if (response.success) {
          console.log('✅ AuthScreen: Seller push token registered successfully');
          // Store the token ID for later deactivation
          if (response.data && response.data.data && response.data.data.id) {
            await AsyncStorage.setItem('sellerPushTokenId', response.data.data.id);
            console.log('💾 AuthScreen: Stored seller push token ID for future use');
          }
        } else {
          console.error('❌ AuthScreen: Failed to register seller push token:', response.error);
        }
      } else {
        console.log('⚠️ AuthScreen: No push token or user available');
      }
    } catch (error) {
      console.error('❌ AuthScreen: Error in seller push token registration:', error);
    }
  }

  // Animation setup
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (user) {
        try {
          setStatus("Checking user profile...");
          const exists = await checkIfUserExists(user.id);

          setStatus("Redirecting...");
          if (exists === 200) {
            await registerAndFetchToken();
            setTimeout(() => {
              router.dismissTo("/(main)");
            }, 500); // Small delay for smoother transition
          } else {
            setTimeout(() => {
              router.dismissTo("/(seller-registration)"); // TODO: add popup in case user wants to switch accounts
            }, 500); // Small delay for smoother transition
          }
        } catch (error) {
          setStatus("Something went wrong");
          console.error("Error in user redirection flow:", error);
          setTimeout(() => setLoading(false), 1000);
        }
      } else {
        setStatus("Waiting for user information...");
        // If no user after 3 seconds, we might have a problem
        setTimeout(() => {
          if (!user) {
            setLoading(false);
            setStatus("No user found. Please sign in again.");
          }
        }, 3000);
      }
    };

    checkUserAndRedirect();
  }, [user, router]);

  useEffect(() => {
    // Start the pulsating animation
    scale.value = withRepeat(
      withTiming(1.2, {
        duration: 500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Infinite repeat
      true // Reverse
    );
  }, []);

  const checkIfUserExists = async (userid: string) => {
    try {
      setStatus("Connecting to server...");

      const hasAccount = user?.publicMetadata.storeId;

      if (hasAccount) {
        return 200;
      } else {
        return 404;
      }
    } catch (error) {}
  };

  return (
    <Layout
      style={[
        styles.container,
        { backgroundColor: theme["color-primary-500"] },
      ]}
    >
      {loading ? (
        <>
          <Animated.View style={animatedStyle}>
            <Icon
              name="ShoppingBag"
              style={{
                width: 80,
                height: 80,
                tintColor: theme["color-basic-100"]
              }}
            />
          </Animated.View>
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Text category="s1" status="control" style={styles.errorText}>
            {status}
          </Text>
          <Text
            category="h6"
            status="control"
            style={styles.linkText}
            onPress={() => router.replace("/")}
          >
            Return to Login
          </Text>
        </View>
      )}
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 20,
  },
  errorContainer: {
    alignItems: "center",
  },
  errorText: {
    textAlign: "center",
    marginBottom: 20,
  },
  linkText: {
    textDecorationLine: "underline",
    marginTop: 20,
  },
});
