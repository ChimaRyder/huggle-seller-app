import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, CheckBox } from '@ui-kitten/components';
import { Formik } from 'formik';
import { FormLayout } from '../components/FormLayout';
import { useSellerRegistration } from '../SellerRegistrationContext';
import { termsSchema } from '../validationSchemas';
import { useRouter } from 'expo-router';

const TermsScreen = () => {
  const { formData, updateFormData, setCurrentStep } = useSellerRegistration();
  const router = useRouter();
  
  const handleSubmit = (values: typeof formData) => {
    // Update the form data with the final values
    updateFormData(values);
    
    // Log the complete form data to the console
    console.log('Seller Registration Form Data:', {
      ...formData,
      ...values
    });
    
    // Navigate to the tabs screen or success screen
    router.push('/(tabs)');
  };
  
  const handleBack = () => {
    setCurrentStep(5);
  };
  
  return (
    <Formik
      // initialValues={{
      //   agreeToTerms: formData.agreeToTerms,
      // }}
      initialValues={formData}
      validationSchema={termsSchema}
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
          <View style={styles.termsContainer}>
            <ScrollView style={styles.termsScrollView}>
              <Text category="h6" style={styles.termsHeader}>
                Seller Agreement
              </Text>
              
              <Text style={styles.termsParagraph}>
                This Seller Agreement ("Agreement") is entered into between you ("Seller") and Huggle ("Platform").
              </Text>
              
              <Text style={styles.termsParagraph}>
                <Text style={styles.bold}>1. Seller Obligations.</Text> Seller agrees to:
              </Text>
              
              <Text style={styles.termsList}>
                a) Provide accurate and complete information during registration;{'\n'}
                b) Comply with all applicable laws and regulations;{'\n'}
                c) Maintain the quality and accuracy of product listings;{'\n'}
                d) Process and fulfill orders promptly;{'\n'}
                e) Respond to customer inquiries within 24 hours;{'\n'}
                f) Comply with the Platform's policies and guidelines.
              </Text>
              
              <Text style={styles.termsParagraph}>
                <Text style={styles.bold}>2. Platform Fees.</Text> Seller agrees to pay the Platform a commission on each successful sale as outlined in the Fee Schedule.
              </Text>
              
              <Text style={styles.termsParagraph}>
                <Text style={styles.bold}>3. Prohibited Items.</Text> Seller shall not list or sell any items that are illegal, counterfeit, infringe intellectual property rights, or violate the Platform's prohibited items policy.
              </Text>
              
              <Text style={styles.termsParagraph}>
                <Text style={styles.bold}>4. Account Suspension.</Text> The Platform reserves the right to suspend or terminate Seller's account for violations of this Agreement, low performance metrics, or other reasons as determined by the Platform.
              </Text>
              
              <Text style={styles.termsParagraph}>
                <Text style={styles.bold}>5. Privacy and Data.</Text> Seller agrees to the Platform's Privacy Policy regarding the collection, use, and sharing of data.
              </Text>
              
              <Text style={styles.termsParagraph}>
                <Text style={styles.bold}>6. Taxes.</Text> Seller is responsible for all taxes related to their sales and business operations.
              </Text>
              
              <Text style={styles.termsParagraph}>
                <Text style={styles.bold}>7. Term and Termination.</Text> This Agreement remains in effect until terminated by either party with written notice.
              </Text>
              
              <Text style={styles.termsParagraph}>
                <Text style={styles.bold}>8. Modifications.</Text> The Platform may modify this Agreement with notice to Seller.
              </Text>
              
              <Text style={styles.termsParagraph}>
                <Text style={styles.bold}>9. Governing Law.</Text> This Agreement shall be governed by the laws of [Jurisdiction].
              </Text>
              
              <Text style={styles.termsParagraph}>
                By checking the box below, you acknowledge that you have read, understood, and agree to be bound by this Agreement.
              </Text>
            </ScrollView>
          </View>
          
          <View style={styles.checkboxContainer}>
            <CheckBox
              checked={values.agreeToTerms}
              onChange={checked => setFieldValue('agreeToTerms', checked)}
              status={touched.agreeToTerms && errors.agreeToTerms ? 'danger' : 'basic'}
            >
              <Text>
                I agree to these Terms and Conditions and Data Privacy Policy
              </Text>
            </CheckBox>
            
            {touched.agreeToTerms && errors.agreeToTerms && (
              <Text status="danger" style={styles.errorText}>
                {errors.agreeToTerms}
              </Text>
            )}
          </View>
        </FormLayout>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  termsContainer: {
    height: 300,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 4,
    marginBottom: 16,
  },
  termsScrollView: {
    padding: 16,
  },
  termsHeader: {
    marginBottom: 16,
  },
  termsParagraph: {
    marginBottom: 12,
    lineHeight: 20,
  },
  termsList: {
    marginBottom: 12,
    paddingLeft: 16,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  checkboxContainer: {
    marginTop: 16,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
  },
});

export default TermsScreen;
