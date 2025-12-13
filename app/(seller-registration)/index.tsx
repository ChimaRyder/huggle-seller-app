import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { SellerRegistrationProvider, useSellerRegistration } from './SellerRegistrationContext';
import { Stack } from 'expo-router';
import ShopInfoScreen from './_screens/ShopInfoScreen';
import BusinessInfoScreen from './_screens/BusinessInfoScreen';
import EntityInfoScreen from './_screens/EntityInfoScreen';
import AddressInfoScreen from './_screens/AddressInfoScreen';
import TaxInfoScreen from './_screens/TaxInfoScreen';
import TermsScreen from './_screens/TermsScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// All step screens in order
const SCREENS = [
  ShopInfoScreen,
  BusinessInfoScreen,
  EntityInfoScreen,
  AddressInfoScreen,
  TaxInfoScreen,
  TermsScreen,
];

// This component handles animated transitions between steps
const StepScreen = () => {
  const { currentStep } = useSellerRegistration();
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const prevStepRef = useRef(currentStep);

  useEffect(() => {
    // Determine slide direction based on step change
    const isForward = currentStep > prevStepRef.current;
    
    // Animate out current screen
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: isForward ? -30 : 30,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Update ref after animation starts
      prevStepRef.current = currentStep;
      
      // Reset slide position for incoming screen
      slideAnim.setValue(isForward ? 30 : -30);
      
      // Animate in new screen
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [currentStep, fadeAnim, slideAnim]);

  // Get the current screen component
  const CurrentScreen = SCREENS[currentStep - 1] || SCREENS[0];

  return (
    <Animated.View 
      style={[
        styles.screenContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <CurrentScreen />
    </Animated.View>
  );
};

export default function SellerRegistrationScreen() {
  return (
    <SellerRegistrationProvider>
      <Stack.Screen options={{ 
        title: 'Seller Registration',
        headerShown: false,
        animation: 'none', // Disable stack animation since we handle it
      }} />
      <View style={styles.container}>
        <StepScreen />
      </View>
    </SellerRegistrationProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});
