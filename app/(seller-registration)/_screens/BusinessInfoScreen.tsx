import React from "react";
import { StyleSheet, View } from "react-native";
import {
  Input,
  Select,
  SelectItem,
  IndexPath,
  Text,
} from "@ui-kitten/components";
import { Formik } from "formik";
import { FormLayout } from "../components/FormLayout";
import { useSellerRegistration } from "../SellerRegistrationContext";
import { businessInfoSchema } from "../../../utils/validationSchemas";
import { useUser } from "@clerk/clerk-expo";

const sellerTypes = [
  "Sole Proprietorship",
  "Partnership",
  "Corporation",
  "Cooperative",
  "One Person Corporation",
];

const BusinessInfoScreen = () => {
  const { formData, updateFormData, setCurrentStep } = useSellerRegistration();
  const { user } = useUser();

  const selectedsellerTypeIndex = formData.sellerType
    ? new IndexPath(sellerTypes.indexOf(formData.sellerType))
    : new IndexPath(0);

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
          <Select
            label="Entity Type"
            placeholder="Select your entity type"
            value={values.sellerType}
            selectedIndex={selectedsellerTypeIndex}
            onSelect={(index) => {
              const selectedIndex = index as IndexPath;
              const selectedValue = sellerTypes[selectedIndex.row];
              setFieldValue("sellerType", selectedValue);
            }}
            caption={
              touched.sellerType && errors.sellerType ? errors.sellerType : ""
            }
            status={
              touched.sellerType && errors.sellerType ? "danger" : "basic"
            }
            style={styles.input}
          >
            {sellerTypes.map((type, index) => (
              <SelectItem key={index} title={type} />
            ))}
          </Select>

          <Input
            label="Registered Name"
            placeholder="Enter your registered business name"
            value={values.storeRegisteredName}
            onChangeText={handleChange("storeRegisteredName")}
            onBlur={handleBlur("storeRegisteredName")}
            caption={
              touched.storeRegisteredName && errors.storeRegisteredName
                ? errors.storeRegisteredName
                : ""
            }
            status={
              touched.storeRegisteredName && errors.storeRegisteredName
                ? "danger"
                : "basic"
            }
            style={styles.input}
          />

          <Input
            label="Business Email"
            placeholder="Enter your business email"
            value={values.sellerEmail}
            onChangeText={handleChange("sellerEmail")}
            onBlur={handleBlur("sellerEmail")}
            caption={
              touched.sellerEmail && errors.sellerEmail
                ? errors.sellerEmail
                : ""
            }
            status={
              touched.sellerEmail && errors.sellerEmail ? "danger" : "basic"
            }
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />

          <Input
            label="Business Phone"
            placeholder="Enter your business phone"
            value={values.sellerPhone}
            onChangeText={handleChange("sellerPhone")}
            onBlur={handleBlur("sellerPhone")}
            caption={
              touched.sellerPhone && errors.sellerPhone
                ? errors.sellerPhone
                : ""
            }
            status={
              touched.sellerPhone && errors.sellerPhone ? "danger" : "basic"
            }
            keyboardType="phone-pad"
            style={styles.input}
          />

          <Text appearance="hint" style={styles.infoText}>
            This information will be used to ensure your compliance with the
            Internet Transactions Act (ITA) and for invoicing purposes. Privacy
            of your information is assured and will only be disclosed to
            authorized entities.
          </Text>
        </FormLayout>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
  },
  infoText: {
    marginTop: 16,
    fontSize: 12,
  },
});

export default BusinessInfoScreen;
