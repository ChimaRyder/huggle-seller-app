import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Alert,
} from "react-native";
import { Layout, Text, Button } from "@ui-kitten/components";
import { ProgressIndicator } from "./ProgressIndicator";
import { useSellerRegistration } from "../SellerRegistrationContext";
import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

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
  const { signOut } = useClerk();
  const router = useRouter();
  const [showExitModal, setShowExitModal] = useState(false);

  const handleBackPress = () => {
    if (currentStep === 1) {
      setShowExitModal(true);
    } else if (onBack) {
      onBack();
    }
  };

  const handleExitConfirm = async () => {
    try {
      await signOut();
      router.replace("/(login)");
    } catch (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error", "Failed to sign out. Please try again.");
    }
  };

  const handleExitCancel = () => {
    setShowExitModal(false);
  };

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
          {(currentStep > 1 || currentStep === 1) && (
            <Button
              appearance="outline"
              style={styles.backButton}
              onPress={handleBackPress}
              status="basic"
            >
              {currentStep === 1 ? "Exit" : "Back"}
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

        {/* Exit Confirmation Modal */}
        <Modal
          visible={showExitModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleExitCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text category="h6" style={styles.modalTitle}>
                Exit Seller Registration?
              </Text>
              <Text style={styles.modalText}>
                Are you sure you want to exit? Any unsaved information will be lost.
              </Text>
              <View style={styles.modalButtons}>
                <Button
                  appearance="outline"
                  style={styles.modalButton}
                  onPress={handleExitCancel}
                  status="basic"
                >
                  Cancel
                </Button>
                <Button
                  style={styles.modalButton}
                  onPress={handleExitConfirm}
                  status="danger"
                >
                  Exit
                </Button>
              </View>
            </View>
          </View>
        </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    margin: 20,
    minWidth: 300,
  },
  modalTitle: {
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default FormLayout;
