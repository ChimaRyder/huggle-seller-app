import React from "react";
import { StyleSheet, View, Platform } from "react-native";
import { Input, Select, SelectItem, IndexPath, Button, Text } from "@ui-kitten/components";
import { Formik } from "formik";
import { FormLayout } from "../components/FormLayout";
import { useSellerRegistration } from "../SellerRegistrationContext";
import { shopInfoSchema } from "../../../utils/validationSchemas";
import BusinessHoursPicker from '../components/BusinessHoursPicker';

const shopCategories = ["Restaurant", "Grocery", "Market", "Store"];

const ShopInfoScreen = () => {
  const { formData, updateFormData, setCurrentStep } = useSellerRegistration();

  const selectedCategoryIndex = formData.storeCategory
    ? new IndexPath(shopCategories.indexOf(formData.storeCategory))
    : new IndexPath(0);

  // State for time pickers
  const [showOpenPicker, setShowOpenPicker] = React.useState(false);
  const [showClosePicker, setShowClosePicker] = React.useState(false);

  // Helper to format time
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
          <Input
            label="Shop Name"
            placeholder="Enter your shop name"
            value={values.storeName}
            onChangeText={handleChange("storeName")}
            onBlur={handleBlur("storeName")}
            caption={
              touched.storeName && errors.storeName ? errors.storeName : ""
            }
            status={touched.storeName && errors.storeName ? "danger" : "basic"}
            style={styles.input}
          />

          <Input
            label="Shop Description"
            placeholder="Describe your shop"
            value={values.storeDescription}
            onChangeText={handleChange("storeDescription")}
            onBlur={handleBlur("storeDescription")}
            caption={
              touched.storeDescription && errors.storeDescription
                ? errors.storeDescription
                : ""
            }
            status={
              touched.storeDescription && errors.storeDescription
                ? "danger"
                : "basic"
            }
            multiline={true}
            textStyle={{ minHeight: 64 }}
            style={styles.input}
          />

          <Text appearance="hint" style={{ marginBottom: 4, fontWeight: 'bold' }}>Business Hours</Text>
          <BusinessHoursPicker
            value={values.businessHours}
            onChange={val => setFieldValue('businessHours', val)}
            errors={errors.businessHours}
            touched={touched.businessHours}
          />
          {typeof errors.businessHours === 'string' && (
            <Text appearance="hint" status="danger" style={{ color: '#FF3D71', marginBottom: 8 }}>{errors.businessHours}</Text>
          )}

          <Select
            label="Shop Category"
            placeholder="Select your shop category"
            value={values.storeCategory}
            selectedIndex={selectedCategoryIndex}
            onSelect={(index) => {
              const selectedIndex = index as IndexPath;
              const selectedValue = shopCategories[selectedIndex.row];
              setFieldValue("storeCategory", selectedValue);
            }}
            caption={
              touched.storeCategory && errors.storeCategory
                ? errors.storeCategory
                : ""
            }
            status={
              touched.storeCategory && errors.storeCategory ? "danger" : "basic"
            }
            style={styles.input}
          >
            {shopCategories.map((category, index) => (
              <SelectItem key={index} title={category} />
            ))}
          </Select>
        </FormLayout>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
  },
});

export default ShopInfoScreen;
