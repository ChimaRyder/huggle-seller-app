import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Input, Radio, RadioGroup, Text, Button } from '@ui-kitten/components';
import { Formik } from 'formik';
import { FormLayout } from '../components/FormLayout';
import { useSellerRegistration } from '../SellerRegistrationContext';
import { taxInfoSchema } from '../validationSchemas';

const TaxInfoScreen = () => {
  const { formData, updateFormData, setCurrentStep } = useSellerRegistration();
  const [selectedVatIndex, setSelectedVatIndex] = useState(
    formData.vatRegistered ? 0 : 1
  );
  
  const handleNext = (values: typeof formData) => {
    updateFormData({
      ...values,
      vatRegistered: selectedVatIndex === 0,
    });
    setCurrentStep(6);
  };
  
  const handleBack = () => {
    setCurrentStep(4);
  };
  
  // Mock file upload
  const handleUploadCertificate = () => {
    // In a real app, this would trigger a file picker
    // For demo purposes, we'll just set a mock file name
    return 'business_certificate.pdf';
  };
  
  return (
    <Formik
      // initialValues={{
      //   taxpayerIdentificationNumber: formData.taxpayerIdentificationNumber,
      //   vatRegistrationStatus: formData.vatRegistrationStatus,
      //   vatRegistered: formData.vatRegistered,
      //   businessCertificate: formData.businessCertificate,
      //   swinDeclaration: formData.swinDeclaration,
      // }}
      initialValues={formData}
      validationSchema={taxInfoSchema}
      onSubmit={handleNext}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
        <FormLayout
          title="Tax Information"
          subtitle="Provide your tax details for compliance"
          onNext={() => handleSubmit()}
          onBack={handleBack}
          isNextDisabled={
            !values.taxpayerIdentificationNumber || 
            !values.vatRegistrationStatus || 
            !values.swinDeclaration
          }
        >
          <Input
            label="Taxpayer Identification Number (TIN)"
            placeholder="Enter your TIN"
            value={values.taxpayerIdentificationNumber}
            onChangeText={handleChange('taxpayerIdentificationNumber')}
            onBlur={handleBlur('taxpayerIdentificationNumber')}
            caption={touched.taxpayerIdentificationNumber && errors.taxpayerIdentificationNumber 
              ? errors.taxpayerIdentificationNumber 
              : 'Your TIN should be 9 digits. Please use "-" if you have one, e.g. 123-456-789'}
            status={touched.taxpayerIdentificationNumber && errors.taxpayerIdentificationNumber ? 'danger' : 'basic'}
            keyboardType="numeric"
            style={styles.input}
          />
          
          <Text category="s1" style={styles.label}>
            Value Added Tax Registration Status
          </Text>
          
          <RadioGroup
            selectedIndex={selectedVatIndex}
            onChange={index => {
              setSelectedVatIndex(index);
              setFieldValue('vatRegistrationStatus', index === 0 ? 'VAT Registered' : 'Non-VAT Registered');
            }}
            style={styles.radioGroup}
          >
            <Radio>VAT Registered</Radio>
            <Radio>Non-VAT Registered</Radio>
          </RadioGroup>
          
          {touched.vatRegistrationStatus && errors.vatRegistrationStatus && (
            <Text status="danger" style={styles.errorText}>
              {errors.vatRegistrationStatus}
            </Text>
          )}
          
          <View style={styles.uploadContainer}>
            <Text category="s1" style={styles.label}>
              BIR Certificate of Registration
            </Text>
            
            <View style={styles.uploadRow}>
              <Text appearance="hint" style={styles.fileName}>
                {values.businessCertificate ? values.businessCertificate : 'No file selected'}
              </Text>
              
              <Button
                size="small"
                appearance="outline"
                onPress={() => {
                  const fileName = handleUploadCertificate();
                  setFieldValue('businessCertificate', fileName);
                }}
              >
                Upload
              </Button>
            </View>
            
            <Text appearance="hint" style={styles.uploadHint}>
              Supported file types: JPG, JPEG, PNG, PDF. Maximum size: 10MB
            </Text>
          </View>
          
          <View style={styles.declarationContainer}>
            <Radio
              checked={values.swinDeclaration}
              onChange={checked => setFieldValue('swinDeclaration', checked)}
              status={touched.swinDeclaration && errors.swinDeclaration ? 'danger' : 'basic'}
            >
              <Text>
                I declare that the information provided is accurate and complete. I understand that providing false information may result in legal consequences.
              </Text>
            </Radio>
            
            {touched.swinDeclaration && errors.swinDeclaration && (
              <Text status="danger" style={styles.errorText}>
                {errors.swinDeclaration}
              </Text>
            )}
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
  label: {
    marginBottom: 8,
  },
  radioGroup: {
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 16,
    fontSize: 12,
  },
  uploadContainer: {
    marginBottom: 24,
  },
  uploadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileName: {
    flex: 1,
    marginRight: 8,
  },
  uploadHint: {
    fontSize: 12,
  },
  declarationContainer: {
    marginTop: 16,
  },
});

export default TaxInfoScreen;
