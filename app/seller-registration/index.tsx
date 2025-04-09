import React from 'react';
import { SellerRegistrationProvider } from './SellerRegistrationContext';
import { Stack } from 'expo-router';
import ShopInfoScreen from './_screens/ShopInfoScreen';
import BusinessInfoScreen from './_screens/BusinessInfoScreen';
import EntityInfoScreen from './_screens/EntityInfoScreen';
import AddressInfoScreen from './_screens/AddressInfoScreen';
import TaxInfoScreen from './_screens/TaxInfoScreen';
import TermsScreen from './_screens/TermsScreen';
import { useSellerRegistration } from './SellerRegistrationContext';

// This component determines which screen to show based on the current step
const StepScreen = () => {
  const { currentStep } = useSellerRegistration();
  
  switch (currentStep) {
    case 1:
      return <ShopInfoScreen />;
    case 2:
      return <BusinessInfoScreen />;
    case 3:
      return <EntityInfoScreen />;
    case 4:
      return <AddressInfoScreen />;
    case 5:
      return <TaxInfoScreen />;
    case 6:
      return <TermsScreen />;
    default:
      return <ShopInfoScreen />;
  }
};

export default function SellerRegistrationScreen() {
  return (
    <SellerRegistrationProvider>
      <Stack.Screen options={{ 
        title: 'Seller Registration',
        headerShown: false
      }} />
      <StepScreen />
    </SellerRegistrationProvider>
  );
}
