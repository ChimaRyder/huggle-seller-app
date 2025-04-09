import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Input, Select, SelectItem, IndexPath, Button, Text } from '@ui-kitten/components';
import { Formik } from 'formik';
import { FormLayout } from '../components/FormLayout';
import { useSellerRegistration } from '../SellerRegistrationContext';
import { businessInfoSchema } from '../validationSchemas';

const entityTypes = [
  'Sole Proprietorship',
  'Partnership',
  'Corporation',
  'Cooperative',
  'One Person Corporation'
];

const BusinessInfoScreen = () => {
  const { formData, updateFormData, setCurrentStep } = useSellerRegistration();
  
  const selectedEntityTypeIndex = formData.entityType 
    ? new IndexPath(entityTypes.indexOf(formData.entityType))
    : new IndexPath(0);
  
  const handleNext = (values: typeof formData) => {
    updateFormData(values);
    setCurrentStep(3);
  };
  
  const handleBack = () => {
    setCurrentStep(1);
  };
  
  // Mock phone verification
  const handleVerifyPhone = (setFieldValue: (field: string, value: any) => void) => {
    // In a real app, this would trigger a verification process
    // For demo purposes, we'll just set it to verified
    setTimeout(() => {
      setFieldValue('businessPhoneVerified', true);
    }, 1000);
  };
  
  return (
    <Formik
      // initialValues={{
      //   entityType: formData.entityType,
      //   registeredName: formData.registeredName,
      //   businessEmail: formData.businessEmail,
      //   businessPhone: formData.businessPhone,
      //   businessPhoneVerified: formData.businessPhoneVerified,
      // }}
      initialValues={formData}
      validationSchema={businessInfoSchema}
      onSubmit={handleNext}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
        <FormLayout
          title="Business Information"
          subtitle="Tell us about your business"
          onNext={() => handleSubmit()}
          onBack={handleBack}
          isNextDisabled={
            !values.entityType || 
            !values.registeredName || 
            !values.businessEmail || 
            !values.businessPhone ||
            !values.businessPhoneVerified
          }
        >
          <Select
            label="Entity Type"
            placeholder="Select your entity type"
            value={values.entityType}
            selectedIndex={selectedEntityTypeIndex}
            onSelect={(index) => {
              const selectedIndex = index as IndexPath;
              const selectedValue = entityTypes[selectedIndex.row];
              setFieldValue('entityType', selectedValue);
            }}
            caption={touched.entityType && errors.entityType ? errors.entityType : ''}
            status={touched.entityType && errors.entityType ? 'danger' : 'basic'}
            style={styles.input}
          >
            {entityTypes.map((type, index) => (
              <SelectItem key={index} title={type} />
            ))}
          </Select>
          
          <Input
            label="Registered Name"
            placeholder="Enter your registered business name"
            value={values.registeredName}
            onChangeText={handleChange('registeredName')}
            onBlur={handleBlur('registeredName')}
            caption={touched.registeredName && errors.registeredName ? errors.registeredName : ''}
            status={touched.registeredName && errors.registeredName ? 'danger' : 'basic'}
            style={styles.input}
          />
          
          <Input
            label="Business Email"
            placeholder="Enter your business email"
            value={values.businessEmail}
            onChangeText={handleChange('businessEmail')}
            onBlur={handleBlur('businessEmail')}
            caption={touched.businessEmail && errors.businessEmail ? errors.businessEmail : ''}
            status={touched.businessEmail && errors.businessEmail ? 'danger' : 'basic'}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          
          <View style={styles.phoneContainer}>
            <Input
              label="Business Phone"
              placeholder="Enter your business phone"
              value={values.businessPhone}
              onChangeText={handleChange('businessPhone')}
              onBlur={handleBlur('businessPhone')}
              caption={touched.businessPhone && errors.businessPhone ? errors.businessPhone : ''}
              status={touched.businessPhone && errors.businessPhone ? 'danger' : 'basic'}
              keyboardType="phone-pad"
              style={styles.phoneInput}
            />
            
            <Button
              size="small"
              status={values.businessPhoneVerified ? 'success' : 'primary'}
              disabled={!values.businessPhone || values.businessPhoneVerified}
              onPress={() => handleVerifyPhone(setFieldValue)}
              style={styles.verifyButton}
            >
              {values.businessPhoneVerified ? 'Verified' : 'Verify'}
            </Button>
          </View>
          
          {touched.businessPhoneVerified && errors.businessPhoneVerified && (
            <Text status="danger" style={styles.errorText}>
              {errors.businessPhoneVerified}
            </Text>
          )}
          
          <Text appearance="hint" style={styles.infoText}>
            This information will be used to ensure your compliance with the Internet Transactions Act (ITA) and for invoicing purposes.
            Privacy of your information is assured and will only be disclosed to authorized entities.
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
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  phoneInput: {
    flex: 1,
    marginRight: 8,
  },
  verifyButton: {
    marginTop: 24,
  },
  errorText: {
    marginBottom: 16,
  },
  infoText: {
    marginTop: 16,
    fontSize: 12,
  },
});

export default BusinessInfoScreen;