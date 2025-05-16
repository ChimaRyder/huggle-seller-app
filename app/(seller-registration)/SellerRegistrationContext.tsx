import React, { createContext, use, useContext, useState } from "react";
import { useUser } from "@clerk/clerk-expo";

// Define the shape of our seller registration form data
export interface SellerRegistrationFormData {
  // Shop Information
  storeName: string;
  storeDescription: string;
  storeCategory: string;

  // Business Information
  sellerType: string;
  storeRegisteredName: string;
  sellerEmail: string;
  sellerPhone: string;

  // Entity Information
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  businessName?: string;

  // Address Information
  address: string;
  city: string;
  province: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;

  // Tax Information
  governmentIdType?: string;
  governmentIdImage?: string;
  businessPermitPdf?: string;
}

// Initial form data
const initialFormData: SellerRegistrationFormData = {
  // Shop Information
  storeName: "",
  storeDescription: "",
  storeCategory: "Restaurant",

  // Business Information
  sellerType: "Sole Proprietorship",
  storeRegisteredName: "",
  sellerEmail: "",
  sellerPhone: "",

  // Entity Information
  firstName: "",
  lastName: "",
  middleName: "",
  suffix: "",
  businessName: "",

  // Address Information
  address: "",
  city: "",
  province: "Cebu",
  zipCode: "",
  latitude: undefined,
  longitude: undefined,

  // Tax Information
  governmentIdType: "",
  governmentIdImage: "",
  businessPermitPdf: "",
};

// Define the context type
interface SellerRegistrationContextType {
  formData: SellerRegistrationFormData;
  updateFormData: (data: Partial<SellerRegistrationFormData>) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
}

// Create the context
const SellerRegistrationContext = createContext<
  SellerRegistrationContextType | undefined
>(undefined);

// Create a provider component
export const SellerRegistrationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [formData, setFormData] =
    useState<SellerRegistrationFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6; // Total number of form screens

  const updateFormData = (data: Partial<SellerRegistrationFormData>) => {
    setFormData((prevData) => ({ ...prevData, ...data }));
  };

  return (
    <SellerRegistrationContext.Provider
      value={{
        formData,
        updateFormData,
        currentStep,
        setCurrentStep,
        totalSteps,
      }}
    >
      {children}
    </SellerRegistrationContext.Provider>
  );
};

// Create a hook to use the context
export const useSellerRegistration = () => {
  const context = useContext(SellerRegistrationContext);
  if (context === undefined) {
    throw new Error(
      "useSellerRegistration must be used within a SellerRegistrationProvider"
    );
  }
  return context;
};

export default SellerRegistrationProvider;
