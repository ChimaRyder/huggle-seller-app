import React, { createContext, useContext, useState } from 'react';

// Define the shape of our seller registration form data
export interface SellerRegistrationFormData {
  // Shop Information
  shopName: string;
  shopDescription: string;
  shopCategory: string;
  
  // Business Information
  entityType: string;
  registeredName: string;
  businessEmail: string;
  businessPhone: string;
  businessPhoneVerified: boolean;
  
  // Entity Information
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  businessName?: string;
  
  // Address Information
  registeredAddress: string;
  city: string;
  province: string;
  zipCode: string;
  
  // Tax Information
  taxpayerIdentificationNumber: string;
  vatRegistrationStatus: string;
  vatRegistered: boolean;
  businessCertificate?: any;
  swinDeclaration: boolean;
  
  // Terms and Conditions
  agreeToTerms: boolean;
}

// Initial form data
const initialFormData: SellerRegistrationFormData = {
  // Shop Information
  shopName: '',
  shopDescription: '',
  shopCategory: 'Restaurant',
  
  // Business Information
  entityType: 'Sole Proprietorship',
  registeredName: '',
  businessEmail: '',
  businessPhone: '',
  businessPhoneVerified: false,
  
  // Entity Information
  firstName: '',
  lastName: '',
  middleName: '',
  suffix: '',
  businessName: '',
  
  // Address Information
  registeredAddress: '',
  city: '',
  province: 'Cebu',
  zipCode: '',
  
  // Tax Information
  taxpayerIdentificationNumber: '',
  vatRegistrationStatus: '',
  vatRegistered: false,
  businessCertificate: null,
  swinDeclaration: false,
  
  // Terms and Conditions
  agreeToTerms: false,
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
const SellerRegistrationContext = createContext<SellerRegistrationContextType | undefined>(undefined);

// Create a provider component
export const SellerRegistrationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData, setFormData] = useState<SellerRegistrationFormData>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6; // Total number of form screens
  
  const updateFormData = (data: Partial<SellerRegistrationFormData>) => {
    setFormData(prevData => ({ ...prevData, ...data }));
  };
  
  return (
    <SellerRegistrationContext.Provider value={{ 
      formData, 
      updateFormData, 
      currentStep, 
      setCurrentStep,
      totalSteps
    }}>
      {children}
    </SellerRegistrationContext.Provider>
  );
};

// Create a hook to use the context
export const useSellerRegistration = () => {
  const context = useContext(SellerRegistrationContext);
  if (context === undefined) {
    throw new Error('useSellerRegistration must be used within a SellerRegistrationProvider');
  }
  return context;
};

export default SellerRegistrationProvider;