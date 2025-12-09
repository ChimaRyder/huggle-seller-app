import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Modal,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Check } from "lucide-react-native";
import { colors, spacing, typography, radii } from "@/constants/theme";
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
        <TouchableOpacity
          style={[styles.continueButton, isNextDisabled && styles.continueButtonDisabled]}
          onPress={onNext}
          disabled={isNextDisabled}
        >
          <Check size={20} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>

      <ProgressIndicator />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>{children}</View>
      </ScrollView>

      {/* Exit Confirmation Modal */}
      <Modal
        visible={showExitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={handleExitCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Exit Seller Registration?
            </Text>
            <Text style={styles.modalText}>
              Are you sure you want to exit? Any unsaved information will be lost.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonOutline]}
                onPress={handleExitCancel}
              >
                <Text style={styles.modalButtonTextOutline}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={handleExitConfirm}
              >
                <Text style={styles.modalButtonText}>Exit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: spacing.xxxl,
  },
  formContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderRadius: radii.lg,
    padding: spacing.xl,
    margin: spacing.lg,
    minWidth: 300,
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  modalText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    alignItems: 'center',
  },
  modalButtonOutline: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.primary,
  },
  modalButtonDanger: {
    backgroundColor: colors.error,
  },
  modalButtonText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.inverse,
  },
  modalButtonTextOutline: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
});

export default FormLayout;
