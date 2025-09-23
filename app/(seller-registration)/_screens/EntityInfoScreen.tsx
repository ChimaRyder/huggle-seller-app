import React from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from "react-native";
import { Formik } from "formik";
import { User, Building, AlertCircle } from "lucide-react-native";
import { colors, spacing, typography, radii } from "@/constants/theme";
import { FormLayout } from "../components/FormLayout";
import { useSellerRegistration } from "../SellerRegistrationContext";
import { entityInfoSchema } from "../../../utils/validationSchemas";

const suffixOptions = ["", "Jr.", "Sr.", "II", "III", "IV", "V"];

const EntityInfoScreen = () => {
  const { formData, updateFormData, setCurrentStep } = useSellerRegistration();

  const handleNext = (values: typeof formData) => {
    console.log("Form values:", values);
    console.log(
      "Is disabled?",
      !values.firstName ||
        !values.lastName ||
        (values.sellerType !== "Sole Proprietorship" && !values.businessName)
    );
    updateFormData(values);
    setCurrentStep(4);
  };

  const handleBack = (values: typeof formData) => {
    console.log("Form values:", values);
    console.log(
      "Is disabled?",
      !values.firstName ||
        !values.lastName ||
        (values.sellerType !== "Sole Proprietorship" && !values.businessName)
    );
    setCurrentStep(2);
  };

  return (
    <Formik
      initialValues={formData}
      validationSchema={entityInfoSchema}
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
          title="Entity Information"
          subtitle="Tell us about the registered individual or business entity"
          onNext={() => handleSubmit()}
          onBack={() => handleBack(values)}
          isNextDisabled={
            !values.firstName ||
            !values.lastName ||
            (values.sellerType !== "Sole Proprietorship" &&
              !values.businessName)
          }
        >
          {/* Personal Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Legal name information for registration
            </Text>

            <Text style={styles.label}>First Name</Text>
            {errors.firstName && touched.firstName && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.firstName}</Text>
              </View>
            )}
            <TextInput
              style={[
                styles.textInput,
                errors.firstName && touched.firstName && { borderColor: colors.error }
              ]}
              placeholder="Enter your first name"
              placeholderTextColor={colors.text.tertiary}
              value={values.firstName}
              onChangeText={handleChange("firstName")}
              onBlur={handleBlur("firstName")}
            />

            <Text style={styles.label}>Last Name</Text>
            {errors.lastName && touched.lastName && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.lastName}</Text>
              </View>
            )}
            <TextInput
              style={[
                styles.textInput,
                errors.lastName && touched.lastName && { borderColor: colors.error }
              ]}
              placeholder="Enter your last name"
              placeholderTextColor={colors.text.tertiary}
              value={values.lastName}
              onChangeText={handleChange("lastName")}
              onBlur={handleBlur("lastName")}
            />

            <Text style={styles.label}>Middle Name (Optional)</Text>
            {errors.middleName && touched.middleName && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.middleName}</Text>
              </View>
            )}
            <TextInput
              style={[
                styles.textInput,
                errors.middleName && touched.middleName && { borderColor: colors.error }
              ]}
              placeholder="Enter your middle name"
              placeholderTextColor={colors.text.tertiary}
              value={values.middleName}
              onChangeText={handleChange("middleName")}
              onBlur={handleBlur("middleName")}
            />

            <Text style={styles.label}>Suffix (Optional)</Text>
            <View style={styles.suffixGrid}>
              {suffixOptions.map((suffix) => (
                <TouchableOpacity
                  key={suffix || "none"}
                  style={[
                    styles.suffixOption,
                    values.suffix === suffix && styles.suffixOptionSelected
                  ]}
                  onPress={() => setFieldValue("suffix", suffix)}
                >
                  <Text style={[
                    styles.suffixText,
                    values.suffix === suffix && styles.suffixTextSelected
                  ]}>
                    {suffix || "None"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Business Information Section (if not Sole Proprietorship) */}
          {values.sellerType !== "Sole Proprietorship" && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Building size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Business Information</Text>
              </View>
              <Text style={styles.sectionDescription}>
                Trade or business name information
              </Text>

              <Text style={styles.label}>Business/Trade Name</Text>
              {errors.businessName && touched.businessName && (
                <View style={styles.errorContainer}>
                  <AlertCircle size={16} color={colors.error} />
                  <Text style={styles.errorText}>{errors.businessName}</Text>
                </View>
              )}
              <TextInput
                style={[
                  styles.textInput,
                  errors.businessName && touched.businessName && { borderColor: colors.error }
                ]}
                placeholder="Enter your business or trade name"
                placeholderTextColor={colors.text.tertiary}
                value={values.businessName}
                onChangeText={handleChange("businessName")}
                onBlur={handleBlur("businessName")}
              />
            </View>
          )}

          {/* Generated Name Preview Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <User size={20} color={colors.info} />
              <Text style={styles.sectionTitle}>Registered Name Preview</Text>
            </View>
            <Text style={styles.sectionDescription}>
              This is how your name will appear on official documents
            </Text>

            <View style={styles.previewContainer}>
              <Text style={styles.previewLabel}>Individual Registered Name</Text>
              <Text style={styles.previewText}>
                {`${values.firstName || '[First Name]'} ${
                  values.middleName ? values.middleName + " " : ""
                }${values.lastName || '[Last Name]'}${values.suffix ? " " + values.suffix : ""}`}
              </Text>
              <Text style={styles.previewCaption}>
                Individual Registered Name is your full legal name as written on your government records.
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

  // Suffix Selection
  suffixGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  suffixOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
    minWidth: 60,
    alignItems: 'center',
  },
  suffixOptionSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  suffixText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  suffixTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },

  // Preview Container
  previewContainer: {
    backgroundColor: colors.background.infoSubtle,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  previewLabel: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  previewText: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  previewCaption: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});

export default EntityInfoScreen;
