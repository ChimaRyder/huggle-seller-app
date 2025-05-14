import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@ui-kitten/components';
import { useSellerRegistration } from '../SellerRegistrationContext';
import { useTheme } from '@ui-kitten/components';

export const ProgressIndicator = () => {
  const theme = useTheme();
  const { currentStep, totalSteps } = useSellerRegistration();
  
  return (
    <View style={styles.container}>
      <Text category="s1" status="control" style={[styles.progressText, { backgroundColor: theme['color-primary-500'] }]}>
        {currentStep} <Text style={styles.Of}>of</Text> {totalSteps}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
  },
  progressText: {
    textAlign: 'center',
    fontWeight: 'bold',
    marginTop: 20,
    padding: 10,
    marginLeft: 150,
    marginRight: 150,
    borderRadius: 10,
  },
  Of: {
    color: "#F8F8F8",
    fontWeight: 'bold',
    opacity: 0.5,
  },
});

export default ProgressIndicator;