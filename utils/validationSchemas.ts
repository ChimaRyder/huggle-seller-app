import * as yup from "yup";

// const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9] ?([AP]M)$/i;

// Shop Information Schema
export const shopInfoSchema = yup.object().shape({
  storeName: yup.string().required("Shop name is required"),
  storeDescription: yup.string().required("Shop description is required"),
  storeCategory: yup.string().required("Shop category is required"),
  businessHours: yup.array().of(
    yup.object().shape({
      isOpen: yup.boolean().required(),
      openTime: yup.string().when('isOpen', {
        is: true, 
        then: schema => schema.required('Opening time required').matches(timeRegex, 'Invalid time format'),
        otherwise: schema => schema.notRequired()
      }),
      closeTime: yup.string().when('isOpen', {
        is: true,
        then: schema => schema.required('Closing time required').matches(timeRegex, 'Invalid time format'),
        otherwise: schema => schema.notRequired()
      }),
    })
  ).length(7, 'Must have 7 days'),
});

// Business Information Schema
export const businessInfoSchema = yup.object().shape({
  sellerType: yup.string().required("Entity type is required"),
  storeRegisteredName: yup.string().required("Registered name is required"),
  sellerEmail: yup.string().required("Business email is required"),
  sellerPhone: yup.string().required("Business phone is required"),
});

// Entity Information Schema
export const entityInfoSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  middleName: yup.string(),
  suffix: yup.string(),
  businessName: yup.string().when("sellerType", {
    is: (val: string) => val !== "Sole Proprietorship",
    then: (schema) => schema.required("Business name is required"),
    otherwise: (schema) => schema,
  }),
});

// Address Information Schema
export const addressInfoSchema = yup.object().shape({
  address: yup.string().required("Registered address is required"),
  city: yup.string().required("City is required"),
  province: yup.string().required("Province is required"),
  zipCode: yup.string().required("Zip code is required"),
  latitude: yup.number().required("Location coordinates are required"),
  longitude: yup.number().required("Location coordinates are required"),
});

// Tax Information Schema
export const taxInfoSchema = yup.object().shape({
  governmentIdType: yup.string().required("Government ID type is required"),
  governmentIdImage: yup.mixed().required("Government ID image is required"),
  businessPermitPdf: yup.mixed().required("Business permit PDF is required"),
});
