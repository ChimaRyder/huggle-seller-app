import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Layout, Text, Button } from "@ui-kitten/components";
import { ProgressIndicator } from "./ProgressIndicator";
import { useSellerRegistration } from "../SellerRegistrationContext";

interface FormLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNext: () => void;
  onBack?: () => void;
  isLastStep?: boolean;
  isNextDisabled?: boolean;
}

export const FormLayout: React.FC<FormLayoutProps> = ({
  title,
  subtitle,
  children,
  onNext,
  onBack,
  isLastStep = false,
  isNextDisabled = false,
}) => {
  const { currentStep } = useSellerRegistration();

  return (
    <Layout style={styles.container}>
        <ProgressIndicator />

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text category="h1" style={styles.title}>
            {title}
          </Text>
          {subtitle && (
            <Text category="s1" style={styles.subtitle}>
              {subtitle}
            </Text>
          )}

          <View style={styles.formContainer}>{children}</View>
        </ScrollView>

        <View style={styles.buttonContainer}>
          {currentStep > 1 && onBack && (
            <Button
              appearance="outline"
              style={styles.backButton}
              onPress={onBack}
              status="basic"
            >
              Back
            </Button>
          )}

          <Button
            style={[
              styles.nextButton,
              currentStep === 1 && styles.fullWidthButton,
            ]}
            onPress={onNext}
            disabled={isNextDisabled}
            status="primary"
          >
            {isLastStep ? "Submit" : "Continue"}
          </Button>
        </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  title: {
    marginBottom: 8,
    fontWeight: "bold",
  },
  subtitle: {
    marginBottom: 24,
  },
  formContainer: {
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    paddingBottom: 16,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
  nextButton: {
    flex: 1,
    marginLeft: 8,
  },
  fullWidthButton: {
    flex: 1,
    marginLeft: 0,
  },
});

export default FormLayout;
