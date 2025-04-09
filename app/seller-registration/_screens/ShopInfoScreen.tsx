import React from 'react';
import { StyleSheet } from 'react-native';
import { Input, Select, SelectItem, IndexPath } from '@ui-kitten/components';
import { Formik } from 'formik';
import { FormLayout } from '../components/FormLayout';
import { useSellerRegistration } from '../SellerRegistrationContext';
import { shopInfoSchema } from '../validationSchemas';

const shopCategories = [
  'Restaurant',
  'Grocery',
  'Market',
];

const ShopInfoScreen = () => {
  const { formData, updateFormData, setCurrentStep } = useSellerRegistration();
  
  const selectedCategoryIndex = formData.shopCategory 
    ? new IndexPath(shopCategories.indexOf(formData.shopCategory))
    : new IndexPath(0);
  
  const handleNext = (values: typeof formData) => {
    updateFormData(values);
    setCurrentStep(2);
  };
  
  return (
    <Formik
      // initialValues={{
      //   shopName: formData.shopName,
      //   shopDescription: formData.shopDescription,
      //   shopCategory: formData.shopCategory,
      // }}
      initialValues={formData}
      validationSchema={shopInfoSchema}
      onSubmit={handleNext}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
        <FormLayout
          title="Shop Information"
          subtitle="Tell us about your shop"
          onNext={() => handleSubmit()}
          isNextDisabled={
            !values.shopName || 
            !values.shopDescription || 
            !values.shopCategory
          }
        >
          <Input
            label="Shop Name"
            placeholder="Enter your shop name"
            value={values.shopName}
            onChangeText={handleChange('shopName')}
            onBlur={handleBlur('shopName')}
            caption={touched.shopName && errors.shopName ? errors.shopName : ''}
            status={touched.shopName && errors.shopName ? 'danger' : 'basic'}
            style={styles.input}
          />
          
          <Input
            label="Shop Description"
            placeholder="Describe your shop"
            value={values.shopDescription}
            onChangeText={handleChange('shopDescription')}
            onBlur={handleBlur('shopDescription')}
            caption={touched.shopDescription && errors.shopDescription ? errors.shopDescription : ''}
            status={touched.shopDescription && errors.shopDescription ? 'danger' : 'basic'}
            multiline={true}
            textStyle={{ minHeight: 64 }}
            style={styles.input}
          />
          
          <Select
            label="Shop Category"
            placeholder="Select your shop category"
            value={values.shopCategory}
            selectedIndex={selectedCategoryIndex}
            onSelect={(index) => {
              const selectedIndex = index as IndexPath;
              const selectedValue = shopCategories[selectedIndex.row];
              setFieldValue('shopCategory', selectedValue);
            }}
            caption={touched.shopCategory && errors.shopCategory ? errors.shopCategory : ''}
            status={touched.shopCategory && errors.shopCategory ? 'danger' : 'basic'}
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
