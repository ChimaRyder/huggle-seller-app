import React from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity } from "react-native";
import { Formik } from "formik";
import { Store, Clock, AlertCircle } from "lucide-react-native";
import { colors, spacing, typography, radii } from "@/constants/theme";
import { FormLayout } from "../components/FormLayout";
import { useSellerRegistration } from "../SellerRegistrationContext";
import { shopInfoSchema } from "../../../utils/validationSchemas";
import BusinessHoursPicker from '../components/BusinessHoursPicker';

const shopCategories = ["Restaurant", "Grocery", "Market", "Store"];

const ShopInfoScreen = () => {
  const { formData, updateFormData, setCurrentStep } = useSellerRegistration();

  const handleNext = (values: typeof formData) => {
    updateFormData(values);
    setCurrentStep(2);
  };

  return (
    <Formik
      initialValues={formData}
      validationSchema={shopInfoSchema}
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
          title="Shop Information"
          subtitle="Tell us about your shop"
          onNext={() => handleSubmit()}
          isNextDisabled={
            !values.storeName ||
            !values.storeDescription ||
            !values.storeCategory ||
            !values.businessHours
          }
        >
          {/* Shop Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Store size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Shop Details</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Basic information about your business
            </Text>

            <Text style={styles.label}>Shop Name</Text>
            {errors.storeName && touched.storeName && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.storeName}</Text>
              </View>
            )}
            <TextInput
              style={[
                styles.textInput,
                errors.storeName && touched.storeName && { borderColor: colors.error }
              ]}
              placeholder="Enter your shop name"
              placeholderTextColor={colors.text.tertiary}
              value={values.storeName}
              onChangeText={handleChange("storeName")}
              onBlur={handleBlur("storeName")}
            />

            <Text style={styles.label}>Shop Description</Text>
            {errors.storeDescription && touched.storeDescription && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.storeDescription}</Text>
              </View>
            )}
            <TextInput
              style={[
                styles.descriptionInput,
                errors.storeDescription && touched.storeDescription && { borderColor: colors.error }
              ]}
              multiline
              placeholder="Describe your shop in detail..."
              placeholderTextColor={colors.text.tertiary}
              value={values.storeDescription}
              onChangeText={handleChange("storeDescription")}
              onBlur={handleBlur("storeDescription")}
              textAlignVertical="top"
            />

            <Text style={styles.label}>Shop Category</Text>
            {errors.storeCategory && touched.storeCategory && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.storeCategory}</Text>
              </View>
            )}
            <View style={styles.categoryGrid}>
              {shopCategories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryOption,
                    values.storeCategory === category && styles.categoryOptionSelected
                  ]}
                  onPress={() => setFieldValue("storeCategory", category)}
                >
                  <Text style={[
                    styles.categoryText,
                    values.storeCategory === category && styles.categoryTextSelected
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Business Hours Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Clock size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Business Hours</Text>
            </View>
            <Text style={styles.sectionDescription}>
              When is your shop open for business?
            </Text>

            <BusinessHoursPicker
              value={values.businessHours}
              onChange={val => setFieldValue('businessHours', val)}
              errors={errors.businessHours}
              touched={touched.businessHours}
            />
            {typeof errors.businessHours === 'string' && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.businessHours}</Text>
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
  descriptionInput: {
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    backgroundColor: colors.background.secondary,
    minHeight: 120,
    lineHeight: 22,
    marginBottom: spacing.md,
  },

  // Category Selection
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  categoryOption: {
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
  categoryOptionSelected: {
    backgroundColor: colors.primary + '20',
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  categoryTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
});

export default ShopInfoScreen;
