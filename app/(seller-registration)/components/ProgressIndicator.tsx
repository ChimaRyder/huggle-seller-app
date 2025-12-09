import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import { useSellerRegistration } from '../SellerRegistrationContext';
import { colors, spacing, typography, radii } from '@/constants/theme';

export const ProgressIndicator = () => {
  const { currentStep, totalSteps } = useSellerRegistration();
  const progressAnim = useRef(new Animated.Value(0)).current;

  const progressPercentage = (currentStep / totalSteps) * 100;

  // Animate progress bar when step changes
  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progressPercentage,
      friction: 8,
      tension: 40,
      useNativeDriver: false, // width animation requires native driver to be false
    }).start();
  }, [progressPercentage, progressAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.stepInfo}>
        <Text style={styles.stepText}>
          Step {currentStep} of {totalSteps}
        </Text>
        <Text style={styles.progressPercentage}>
          {Math.round(progressPercentage)}%
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View 
            style={[
              styles.progressBarFill, 
              { 
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]} 
          />
        </View>
      </View>

      <View style={styles.stepDots}>
        {Array.from({ length: totalSteps }, (_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.stepDot,
              index + 1 <= currentStep && styles.stepDotActive,
              index + 1 === currentStep && styles.stepDotCurrent,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  stepInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  stepText: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.secondary,
  },
  progressPercentage: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.primary,
  },
  progressBarContainer: {
    marginBottom: spacing.md,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: colors.background.tertiary,
    borderRadius: radii.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radii.full,
  },
  stepDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
    backgroundColor: colors.background.tertiary,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepDotCurrent: {
    backgroundColor: colors.primary,
    transform: [{ scale: 1.2 }],
  },
});

export default ProgressIndicator;
