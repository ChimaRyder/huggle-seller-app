import React from "react";
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Formik } from "formik";
import { Shield, Check, AlertCircle } from "lucide-react-native";
import { colors, spacing, typography, radii } from "@/constants/theme";
import { FormLayout } from "../components/FormLayout";
import { useSellerRegistration } from "../SellerRegistrationContext";
import { useRouter } from "expo-router";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { createSeller } from "@/utils/data/SellerController";

const TermsScreen = () => {
  const { formData, updateFormData, setCurrentStep } = useSellerRegistration();
  const router = useRouter();
  const { user } = useUser(); // Get user from Clerk
  const {getToken} = useAuth();

  const handleSubmit = async (values: typeof formData) => {
    try {
      // Update the form data with the final values
      updateFormData(values);

      // Add the user ID from Clerk to the values
      const seller = {
        ...formData,
        ...values,
        id: user?.id, // Add the user ID from Clerk
      };

      // Log the complete form data to the console
      console.log("Seller Registration Form Data:", seller);

      // Make the API request
      const token = await getToken({template: "seller_app"});
      console.log(token);
      const response = await createSeller(seller, token ?? "");

      // Handle the response
      if (response.status === 201) {
        console.log("Seller created successfully:", ((response as any).data));
        // Navigate to the tabs screen or success screen
        router.push("/(main)");
      } else {
        console.error("Unexpected response status:", response.status);
        // Handle other status codes if needed
      }
    } catch (error) {
      console.error("Error creating seller:", error);
      // Handle errors - you might want to show an error message to the user
      // For example, using an alert or a toast notification
    }
  };

  const handleBack = () => {
    setCurrentStep(5);
  };

  return (
    <Formik
      initialValues={{
        ...formData,
        agreeToTerms: false,
      }}
      onSubmit={handleSubmit}
    >
      {({ handleSubmit, values, errors, touched, setFieldValue }) => (
        <FormLayout
          title="Terms and Conditions"
          subtitle="Please review and agree to our terms"
          onNext={() => handleSubmit()}
          onBack={handleBack}
          isLastStep={true}
          isNextDisabled={!values.agreeToTerms}
        >
          {/* Terms and Conditions Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Terms and Conditions</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Please read and accept our seller agreement to continue
            </Text>

            <View style={styles.termsContainer}>
              <ScrollView style={styles.termsScrollView} showsVerticalScrollIndicator={false}>
                <Text style={styles.termsHeader}>
                  Seller Agreement
                </Text>

                <Text style={styles.termsParagraph}>
                  This Seller Agreement is entered into between you and Huggle Platform.
                </Text>

                <Text style={styles.termsParagraph}>
                  <Text style={styles.bold}>1. Seller Obligations.</Text> You agree to:
                </Text>

                <Text style={styles.termsList}>
                  • Provide accurate and complete information during registration{"\n"}
                  • Comply with all applicable laws and regulations{"\n"}
                  • Maintain the quality and accuracy of product listings{"\n"}
                  • Process and fulfill orders promptly{"\n"}
                  • Respond to customer inquiries within 24 hours{"\n"}
                  • Comply with the Platform's policies and guidelines
                </Text>

                <Text style={styles.termsParagraph}>
                  <Text style={styles.bold}>2. Platform Fees.</Text> You agree to pay the Platform a commission on each successful sale as outlined in the Fee Schedule.
                </Text>

                <Text style={styles.termsParagraph}>
                  <Text style={styles.bold}>3. Prohibited Items.</Text> You shall not list or sell any items that are illegal, counterfeit, infringe intellectual property rights, or violate our prohibited items policy.
                </Text>

                <Text style={styles.termsParagraph}>
                  <Text style={styles.bold}>4. Account Suspension.</Text> The Platform reserves the right to suspend or terminate your account for violations of this Agreement or low performance metrics.
                </Text>

                <Text style={styles.termsParagraph}>
                  <Text style={styles.bold}>5. Privacy and Data.</Text> You agree to our Privacy Policy regarding the collection, use, and sharing of data.
                </Text>

                <Text style={styles.termsParagraph}>
                  <Text style={styles.bold}>6. Taxes.</Text> You are responsible for all taxes related to your sales and business operations.
                </Text>

                <Text style={styles.termsParagraph}>
                  <Text style={styles.bold}>7. Term and Termination.</Text> This Agreement remains in effect until terminated by either party with written notice.
                </Text>

                <Text style={styles.termsFooter}>
                  By proceeding, you acknowledge that you have read, understood, and agree to be bound by this Agreement.
                </Text>
              </ScrollView>
            </View>

            {/* Agreement Checkbox */}
            <TouchableOpacity
              style={[
                styles.agreementContainer,
                values.agreeToTerms && styles.agreementContainerActive,
                touched.agreeToTerms && errors.agreeToTerms && styles.agreementContainerError
              ]}
              onPress={() => setFieldValue("agreeToTerms", !values.agreeToTerms)}
            >
              <View style={[
                styles.checkbox,
                values.agreeToTerms && styles.checkboxActive
              ]}>
                {values.agreeToTerms && (
                  <Check size={16} color={colors.text.inverse} />
                )}
              </View>
              <Text style={[
                styles.agreementText,
                values.agreeToTerms && styles.agreementTextActive
              ]}>
                I agree to these Terms and Conditions and Data Privacy Policy
              </Text>
            </TouchableOpacity>

            {touched.agreeToTerms && errors.agreeToTerms && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.agreeToTerms}</Text>
              </View>
            )}
          </View>
        </FormLayout>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  // Sections
  section: {
    backgroundColor: colors.background.primary,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  sectionDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },

  // Terms Container
  termsContainer: {
    height: 350,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.background.secondary,
  },
  termsScrollView: {
    flex: 1,
    padding: spacing.lg,
  },
  termsHeader: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  termsParagraph: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.primary,
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  termsList: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.primary,
    marginBottom: spacing.md,
    paddingLeft: spacing.md,
    lineHeight: 22,
  },
  termsFooter: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.lg,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  bold: {
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },

  // Agreement Checkbox
  agreementContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.lg,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.md,
  },
  agreementContainerActive: {
    borderColor: colors.primary,
    backgroundColor: colors.background.successSubtle,
  },
  agreementContainerError: {
    borderColor: colors.error,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: radii.sm,
    borderWidth: 2,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkboxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  agreementText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.primary,
    lineHeight: 22,
    flex: 1,
  },
  agreementTextActive: {
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },

  // Error handling
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSizes.sm,
    color: colors.error,
    marginLeft: spacing.xs,
  },
});

export default TermsScreen;
