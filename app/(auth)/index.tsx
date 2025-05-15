import React, { useEffect, useState } from "react";
import { Alert, View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useClerk } from "@clerk/clerk-expo";
import { Text, Spinner, useTheme, Layout, Icon } from "@ui-kitten/components"; // Changed from react-native-svg for proper Text component
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from "react-native-reanimated";


export default function AuthScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Checking user information...");
  const theme = useTheme();

  // Animation setup
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (user) {
        try {
          setStatus("Checking user profile...");
          console.log("User is signed in:", user.id);
          const exists = await checkIfUserExists(user.id);

          setStatus("Redirecting...");
          if (exists === 200) {
            // console.log("User exists");
            setTimeout(() => {
              router.dismissTo("/(main)");
            }, 500); // Small delay for smoother transition
          } else {
            setTimeout(() => {
              router.dismissTo("/(seller-registration)");
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
        easing: Easing.inOut(Easing.ease) 
      }),
      -1, // Infinite repeat
      true // Reverse
    );
  }, []);

  const checkIfUserExists = async (userid: string) => {
    try {
      const url = "https://huggle-backend-jh2l.onrender.com/api/sellers/get";
      setStatus("Connecting to server...");
      const response = await axios.get(`${url}/${userid}`, {
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
      });
      if (response.status === 200) {
        console.log("User exists");
        return response.status;
      }
    } catch (error) {}
  };

  return (
    <Layout style={[styles.container, {backgroundColor: theme['color-primary-500']}]}>
      {loading ? (
        <>
          <Animated.View style={animatedStyle}>
            <Icon
              name="shopping-bag-outline"
              style={{
                width: 80,
                height: 80,
              }}
              fill={theme['color-basic-100']}
            />
          </Animated.View>
          {/* <Text category="s1" status="control" style={styles.loadingText}>{status}</Text> */}
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Text category="s1" status="control" style={styles.errorText}>{status}</Text>
          <Text category="h6" status="control" style={styles.linkText} onPress={() => router.replace("/")}>
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
