import React from "react";
import { StyleSheet, View } from "react-native";
import { Input, Select, SelectItem, IndexPath } from "@ui-kitten/components";
import { Formik } from "formik";
import { FormLayout } from "../components/FormLayout";
import { useSellerRegistration } from "../SellerRegistrationContext";
import { entityInfoSchema } from "../../../utils/validationSchemas";

const suffixOptions = ["", "Jr.", "Sr.", "II", "III", "IV", "V"];

const EntityInfoScreen = () => {
  const { formData, updateFormData, setCurrentStep } = useSellerRegistration();

  const selectedSuffixIndex = formData.suffix
    ? new IndexPath(suffixOptions.indexOf(formData.suffix))
    : new IndexPath(0);

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
          <Input
            label="First Name"
            placeholder="Enter your first name"
            value={values.firstName}
            onChangeText={handleChange("firstName")}
            onBlur={handleBlur("firstName")}
            caption={
              touched.firstName && errors.firstName ? errors.firstName : ""
            }
            status={touched.firstName && errors.firstName ? "danger" : "basic"}
            style={styles.input}
          />

          <Input
            label="Last Name"
            placeholder="Enter your last name"
            value={values.lastName}
            onChangeText={handleChange("lastName")}
            onBlur={handleBlur("lastName")}
            caption={touched.lastName && errors.lastName ? errors.lastName : ""}
            status={touched.lastName && errors.lastName ? "danger" : "basic"}
            style={styles.input}
          />

          <Input
            label="Middle Name (Optional)"
            placeholder="Enter your middle name"
            value={values.middleName}
            onChangeText={handleChange("middleName")}
            onBlur={handleBlur("middleName")}
            caption={
              touched.middleName && errors.middleName ? errors.middleName : ""
            }
            status={
              touched.middleName && errors.middleName ? "danger" : "basic"
            }
            style={styles.input}
          />

          <Select
            label="Suffix (Optional)"
            placeholder="Select suffix"
            value={values.suffix || "None"}
            selectedIndex={selectedSuffixIndex}
            onSelect={(index) => {
              const selectedIndex = index as IndexPath;
              const selectedValue = suffixOptions[selectedIndex.row];
              setFieldValue("suffix", selectedValue);
            }}
            style={styles.input}
          >
            {suffixOptions.map((suffix, index) => (
              <SelectItem key={index} title={suffix || "None"} />
            ))}
          </Select>

          {values.sellerType !== "Sole Proprietorship" && (
            <Input
              label="Business/Trade Name"
              placeholder="Enter your business or trade name"
              value={values.businessName}
              onChangeText={handleChange("businessName")}
              onBlur={handleBlur("businessName")}
              caption={
                touched.businessName && errors.businessName
                  ? errors.businessName
                  : ""
              }
              status={
                touched.businessName && errors.businessName ? "danger" : "basic"
              }
              style={styles.input}
            />
          )}

          <View style={styles.infoContainer}>
            <Input
              disabled
              label="Individual Registered Name"
              value={`${values.firstName} ${
                values.middleName ? values.middleName + " " : ""
              }${values.lastName}${values.suffix ? " " + values.suffix : ""}`}
              style={styles.input}
              caption="Individual Registered Name is your full legal name as written on your government records."
            />
          </View>
        </FormLayout>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 16,
  },
  infoContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#F7F9FC",
    borderRadius: 4,
  },
});

export default EntityInfoScreen;
