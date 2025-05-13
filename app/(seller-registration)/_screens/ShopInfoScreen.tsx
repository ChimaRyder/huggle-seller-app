import React from "react";
import { StyleSheet } from "react-native";
import { Input, Select, SelectItem, IndexPath } from "@ui-kitten/components";
import { Formik } from "formik";
import { FormLayout } from "../components/FormLayout";
import { useSellerRegistration } from "../SellerRegistrationContext";
import { shopInfoSchema } from "../../../utils/validationSchemas";

const shopCategories = ["Restaurant", "Grocery", "Market", "Store"];

const ShopInfoScreen = () => {
  const { formData, updateFormData, setCurrentStep } = useSellerRegistration();

  const selectedCategoryIndex = formData.storeCategory
    ? new IndexPath(shopCategories.indexOf(formData.storeCategory))
    : new IndexPath(0);

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
            !values.storeCategory
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
