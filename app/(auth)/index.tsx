import React, { useEffect, useState } from "react";
import { Alert, View, ActivityIndicator, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import axios from "axios";
import { useClerk } from "@clerk/clerk-expo";
import { Text } from "@ui-kitten/components"; // Changed from react-native-svg for proper Text component

export default function AuthScreen() {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Checking user information...");

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
              router.replace("/(main)");
            }, 500); // Small delay for smoother transition
          } else {
            setTimeout(() => {
              router.replace("/(seller-registration)");
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

  const checkIfUserExists = async (userid: string) => {
    try {
      const url = "http://10.0.2.2:5132/api/sellers/get";
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
    <View style={styles.container}>
      {loading ? (
        <>
          <ActivityIndicator
            size="large"
            color="#3b5998"
            style={styles.spinner}
          />
          <Text style={styles.loadingText}>{status}</Text>
        </>
      ) : (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{status}</Text>
          <Text style={styles.linkText} onPress={() => router.replace("/")}>
            Return to Login
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  spinner: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
  },
  errorContainer: {
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  linkText: {
    fontSize: 16,
    color: "#3b5998",
    textDecorationLine: "underline",
    marginTop: 20,
  },
});
