import * as yup from 'yup';

// Shop Information Schema
export const shopInfoSchema = yup.object().shape({
  shopName: yup.string().required('Shop name is required'),
  shopDescription: yup.string().required('Shop description is required'),
  shopCategory: yup.string().required('Shop category is required'),
});

// Business Information Schema
export const businessInfoSchema = yup.object().shape({
  entityType: yup.string().required('Entity type is required'),
  registeredName: yup.string().required('Registered name is required'),
  businessEmail: yup.string().email('Invalid email').required('Business email is required'),
  businessPhone: yup.string().required('Business phone is required'),
  businessPhoneVerified: yup.boolean().oneOf([true], 'Phone number must be verified'),
});

// Entity Information Schema
export const entityInfoSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  middleName: yup.string(),
  suffix: yup.string(),
  businessName: yup.string().when('entityType', {
    is: (val: string) => val !== 'Sole Proprietorship',
    then: (schema) => schema.required('Business name is required'),
    otherwise: (schema) => schema,
  }),
});

// Address Information Schema
export const addressInfoSchema = yup.object().shape({
  registeredAddress: yup.string().required('Registered address is required'),
  city: yup.string().required('City is required'),
  province: yup.string().required('Province is required'),
  zipCode: yup.string().required('Zip code is required'),
});

// Tax Information Schema
export const taxInfoSchema = yup.object().shape({
  taxpayerIdentificationNumber: yup.string().required('Taxpayer identification number is required'),
  vatRegistrationStatus: yup.string().required('VAT registration status is required'),
  vatRegistered: yup.boolean(),
  businessCertificate: yup.mixed(),
  swinDeclaration: yup.boolean().oneOf([true], 'You must agree to the SWIN declaration'),
});

// Terms and Conditions Schema
export const termsSchema = yup.object().shape({
  agreeToTerms: yup.boolean().oneOf([true], 'You must agree to the terms and conditions'),
});
