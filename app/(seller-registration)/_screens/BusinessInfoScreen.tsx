import React from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from "react-native";
import { Formik } from "formik";
import { Building, Mail, AlertCircle } from "lucide-react-native";
import { colors, spacing, typography, radii } from "@/constants/theme";
import { FormLayout } from "../components/FormLayout";
import { useSellerRegistration } from "../SellerRegistrationContext";
import { businessInfoSchema } from "../../../utils/validationSchemas";

const sellerTypes = [
  "Sole Proprietorship",
  "Partnership",
  "Corporation",
  "Cooperative",
  "One Person Corporation",
];

const BusinessInfoScreen = () => {
  const { formData, updateFormData, setCurrentStep } = useSellerRegistration();

  const handleNext = (values: typeof formData) => {
    updateFormData(values);
    setCurrentStep(3);
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <Formik
      initialValues={formData}
      validationSchema={businessInfoSchema}
      onSubmit={handleNext}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
        setFieldValue,
      }) => (
        <FormLayout
          title="Business Information"
          subtitle="Tell us about your business"
          onNext={() => handleSubmit()}
          onBack={handleBack}
          isNextDisabled={
            !values.sellerType ||
            !values.storeRegisteredName ||
            !values.sellerPhone
          }
        >
          {/* Business Type Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Building size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Business Type</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Select your business entity type
            </Text>

            <Text style={styles.label}>Entity Type</Text>
            {errors.sellerType && touched.sellerType && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.sellerType}</Text>
              </View>
            )}
            <View style={styles.entityGrid}>
              {sellerTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.entityOption,
                    values.sellerType === type && styles.entityOptionSelected
                  ]}
                  onPress={() => setFieldValue("sellerType", type)}
                >
                  <Text style={[
                    styles.entityText,
                    values.sellerType === type && styles.entityTextSelected
                  ]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Business Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Building size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Business Details</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Official business information
            </Text>

            <Text style={styles.label}>Registered Business Name</Text>
            {errors.storeRegisteredName && touched.storeRegisteredName && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.storeRegisteredName}</Text>
              </View>
            )}
            <TextInput
              style={[
                styles.textInput,
                errors.storeRegisteredName && touched.storeRegisteredName && { borderColor: colors.error }
              ]}
              placeholder="Enter your registered business name"
              placeholderTextColor={colors.text.tertiary}
              value={values.storeRegisteredName}
              onChangeText={handleChange("storeRegisteredName")}
              onBlur={handleBlur("storeRegisteredName")}
            />
          </View>

          {/* Contact Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Mail size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Contact Information</Text>
            </View>
            <Text style={styles.sectionDescription}>
              How customers can reach your business
            </Text>

            <Text style={styles.label}>Business Email</Text>
            {errors.sellerEmail && touched.sellerEmail && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.sellerEmail}</Text>
              </View>
            )}
            <TextInput
              style={[
                styles.textInput,
                errors.sellerEmail && touched.sellerEmail && { borderColor: colors.error }
              ]}
              placeholder="Enter your business email"
              placeholderTextColor={colors.text.tertiary}
              value={values.sellerEmail}
              onChangeText={handleChange("sellerEmail")}
              onBlur={handleBlur("sellerEmail")}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.label}>Business Phone</Text>
            {errors.sellerPhone && touched.sellerPhone && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.sellerPhone}</Text>
              </View>
            )}
            <TextInput
              style={[
                styles.textInput,
                errors.sellerPhone && touched.sellerPhone && { borderColor: colors.error }
              ]}
              placeholder="Enter your business phone"
              placeholderTextColor={colors.text.tertiary}
              value={values.sellerPhone}
              onChangeText={handleChange("sellerPhone")}
              onBlur={handleBlur("sellerPhone")}
              keyboardType="phone-pad"
            />

            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>
                This information will be used to ensure your compliance with the
                Internet Transactions Act (ITA) and for invoicing purposes. Privacy
                of your information is assured and will only be disclosed to
                authorized entities.
              </Text>
            </View>
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
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },

  // Error handling
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSizes.sm,
    color: colors.error,
    marginLeft: spacing.xs,
  },

  // Text Inputs
  textInput: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.md,
  },

  // Entity Type Selection
  entityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  entityOption: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
  },
  entityOptionSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  entityText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  entityTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },

  // Info Container
  infoContainer: {
    backgroundColor: colors.background.infoSubtle,
    padding: spacing.md,
    borderRadius: radii.md,
    marginTop: spacing.md,
  },
  infoText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});

export default BusinessInfoScreen;
