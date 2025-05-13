import * as yup from "yup";

// Shop Information Schema
export const shopInfoSchema = yup.object().shape({
  storeName: yup.string().required("Shop name is required"),
  storeDescription: yup.string().required("Shop description is required"),
  storeCategory: yup.string().required("Shop category is required"),
});

// Business Information Schema
export const businessInfoSchema = yup.object().shape({
  sellerType: yup.string().required("Entity type is required"),
  storeRegisteredName: yup.string().required("Registered name is required"),
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
});

// Tax Information Schema
export const taxInfoSchema = yup.object().shape({
  governmentIdType: yup.string().required("Government ID type is required"),
  governmentIdImage: yup.mixed().required("Government ID image is required"),
  businessPermitPdf: yup.mixed().required("Business permit PDF is required"),
});
