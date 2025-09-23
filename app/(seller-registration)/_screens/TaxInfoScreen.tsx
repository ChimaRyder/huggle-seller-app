import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Text,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Formik } from "formik";
import { FileText, Upload, Camera, AlertCircle, CheckCircle, ChevronDown } from "lucide-react-native";
import { colors, spacing, typography, radii } from "@/constants/theme";
import { FormLayout } from "../components/FormLayout";
import { useSellerRegistration } from "../SellerRegistrationContext";
import { taxInfoSchema } from "../../../utils/validationSchemas";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";


const TaxInfoScreen = () => {
  const { formData, updateFormData, setCurrentStep } = useSellerRegistration();
  const [showIdTypeModal, setShowIdTypeModal] = useState(false);
  const [idImageLoading, setIdImageLoading] = useState(false);
  const [permitLoading, setPermitLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ id: 0, permit: 0 });


  // Government ID types for Philippines
  const governmentIdTypes = [
    "Philippine Passport",
    "SSS ID",
    "UMID",
    "PhilHealth ID",
    "Driver's License",
    "Postal ID",
    "TIN ID",
    "Voter's ID",
    "PRC ID",
    "NBI Clearance",
  ];

  const handleNext = (values: typeof formData) => {
    updateFormData(values);
    setCurrentStep(6);
  };

  const handleBack = () => {
    setCurrentStep(4);
  };

  // Request permissions for media library
  const requestMediaLibraryPermissions = async () => {
    if (Platform.OS !== "web") {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Sorry, we need camera roll permissions to upload images."
        );
        return false;
      }
      return true;
    }
    return true;
  };

  const uploadPlaceholder = async () => {
    Alert.alert(
      "Feature Under Development", 
      "File upload functionality will be available once the new architecture is implemented."
    );
    return "placeholder-url";
  };

  // Handle Government ID Image Upload
  const handleUploadGovernmentId = async (
    setFieldValue: (field: string, value: any) => void
  ) => {
    try {
      const hasPermission = await requestMediaLibraryPermissions();
      if (!hasPermission) return;

      setIdImageLoading(true);
      setUploadProgress((prev) => ({ ...prev, id: 0 }));

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 1200,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];

        // Check file size (limit to 5MB)
        const fileSize = selectedImage.fileSize || 0;
        if (fileSize > 5 * 1024 * 1024) {
          Alert.alert(
            "File Too Large",
            "Please select an image smaller than 5MB"
          );
          return;
        }

        try {
          const fileName =
            selectedImage.fileName ||
            `government_id.${selectedImage.uri.split(".").pop()}`;

          const fileType =
            selectedImage.mimeType ||
            `image/${selectedImage.uri.split(".").pop()}`;

          await uploadPlaceholder();

          setFieldValue("governmentIdImage", {
            uri: selectedImage.uri,
            name: fileName,
            type: fileType,
            size: fileSize,
            localUri: selectedImage.uri,
          });
        } catch (error) {
          Alert.alert(
            "Upload Error",
            "Failed to upload image. Please try again."
          );
          console.error(error);
        }
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    } finally {
      setIdImageLoading(false);
    }
  };

  // Handle Business Permit PDF Upload
  const handleUploadBusinessPermit = async (
    setFieldValue: (field: string, value: any) => void
  ) => {
    try {
      setPermitLoading(true);
      setUploadProgress((prev) => ({ ...prev, permit: 0 }));

      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const selectedDocument = result.assets[0];

        // Check file size (limit to 10MB)
        if (selectedDocument.size > 10 * 1024 * 1024) {
          Alert.alert(
            "File Too Large",
            "Please select a PDF smaller than 10MB"
          );
          return;
        }

        try {
          await uploadPlaceholder();

          setFieldValue("businessPermitPdf", {
            uri: selectedDocument.uri,
            name: selectedDocument.name,
            type: selectedDocument.mimeType,
            size: selectedDocument.size,
          });
        } catch (error) {
          Alert.alert(
            "Upload Error",
            "Failed to upload PDF. Please try again."
          );
          console.error(error);
        }
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "Failed to upload document. Please try again.");
    } finally {
      setPermitLoading(false);
    }
  };

  // Format filename for display
  const formatFileName = (file: any) => {
    if (!file) return "No file selected";

    if (typeof file === "string") return file;

    // If file is an object with a name property
    if (file.name) {
      const fileName = file.name;
      // Truncate long filenames
      return fileName.length > 25
        ? fileName.substring(0, 22) + "..."
        : fileName;
    }

    return "File selected";
  };

  return (
    <Formik
      initialValues={{
        ...formData,
        governmentIdType: formData.governmentIdType || governmentIdTypes[0],
        governmentIdImage: formData.governmentIdImage || "",
        businessPermitPdf: formData.businessPermitPdf || "",
      }}
      validationSchema={taxInfoSchema}
      onSubmit={handleNext}
    >
      {({ handleSubmit, values, errors, touched, setFieldValue }) => (
        <FormLayout
          title="Tax & Identity Verification"
          subtitle="Please provide your government ID and business permit"
          onNext={() => handleSubmit()}
          onBack={handleBack}
          isNextDisabled={
            !values.governmentIdType ||
            !values.governmentIdImage ||
            !values.businessPermitPdf
          }
        >
          {/* Government ID Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <FileText size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Government ID</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Upload a clear photo of your valid government-issued ID
            </Text>

            <Text style={styles.label}>Select ID Type</Text>
            {touched.governmentIdType && errors.governmentIdType && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{errors.governmentIdType}</Text>
              </View>
            )}
            <TouchableOpacity
              style={[
                styles.selectInput,
                touched.governmentIdType && errors.governmentIdType && { borderColor: colors.error }
              ]}
              onPress={() => setShowIdTypeModal(true)}
            >
              <Text style={[
                styles.selectText,
                !values.governmentIdType && styles.selectPlaceholder
              ]}>
                {values.governmentIdType || "Select ID type"}
              </Text>
              <ChevronDown size={20} color={colors.text.secondary} />
            </TouchableOpacity>

            <Text style={styles.label}>Upload ID Image</Text>
            {touched.governmentIdImage && errors.governmentIdImage && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{String(errors.governmentIdImage)}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.uploadButton,
                idImageLoading && styles.uploadButtonDisabled,
                values.governmentIdImage && styles.uploadButtonSuccess
              ]}
              onPress={() => handleUploadGovernmentId(setFieldValue)}
              disabled={idImageLoading}
            >
              {idImageLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.uploadButtonText}>Uploading... {Math.round(uploadProgress.id)}%</Text>
                </View>
              ) : values.governmentIdImage ? (
                <View style={styles.loadingContainer}>
                  <CheckCircle size={20} color={colors.success} />
                  <Text style={[styles.uploadButtonText, { color: colors.success }]}>
                    {formatFileName(values.governmentIdImage)}
                  </Text>
                </View>
              ) : (
                <View style={styles.loadingContainer}>
                  <Camera size={20} color={colors.primary} />
                  <Text style={styles.uploadButtonText}>Upload ID Image</Text>
                </View>
              )}
            </TouchableOpacity>

            {values.governmentIdImage &&
              typeof values.governmentIdImage === "object" &&
              (values.governmentIdImage.localUri ||
                values.governmentIdImage.uri) && (
                <View style={styles.previewContainer}>
                  <Image
                    source={{
                      uri:
                        values.governmentIdImage.localUri ||
                        values.governmentIdImage.uri,
                    }}
                    style={styles.imagePreview}
                    resizeMode="contain"
                  />
                </View>
              )}

            <Text style={styles.uploadHint}>
              Upload a clear, readable image of your government ID.
              Supported: JPG, PNG (max 5MB)
            </Text>
          </View>

          {/* Business Permit Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Upload size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Business Permit</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Upload your official business permit document
            </Text>

            <Text style={styles.label}>Upload Business Permit</Text>
            {touched.businessPermitPdf && errors.businessPermitPdf && (
              <View style={styles.errorContainer}>
                <AlertCircle size={16} color={colors.error} />
                <Text style={styles.errorText}>{String(errors.businessPermitPdf)}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.uploadButton,
                permitLoading && styles.uploadButtonDisabled,
                values.businessPermitPdf && styles.uploadButtonSuccess
              ]}
              onPress={() => handleUploadBusinessPermit(setFieldValue)}
              disabled={permitLoading}
            >
              {permitLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={styles.uploadButtonText}>Uploading... {Math.round(uploadProgress.permit)}%</Text>
                </View>
              ) : values.businessPermitPdf ? (
                <View style={styles.loadingContainer}>
                  <CheckCircle size={20} color={colors.success} />
                  <Text style={[styles.uploadButtonText, { color: colors.success }]}>
                    {formatFileName(values.businessPermitPdf)}
                  </Text>
                </View>
              ) : (
                <View style={styles.loadingContainer}>
                  <FileText size={20} color={colors.primary} />
                  <Text style={styles.uploadButtonText}>Upload Business Permit</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={styles.uploadHint}>
              Upload a PDF copy of your business permit.
              Supported: PDF (max 10MB)
            </Text>
          </View>

          {/* ID Type Selection Modal */}
          <Modal
            visible={showIdTypeModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowIdTypeModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select ID Type</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowIdTypeModal(false)}
                  >
                    <Text style={styles.modalCloseText}>Cancel</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.idTypeList}>
                  {governmentIdTypes.map((idType) => (
                    <TouchableOpacity
                      key={idType}
                      style={[
                        styles.idTypeItem,
                        values.governmentIdType === idType && styles.idTypeItemSelected
                      ]}
                      onPress={() => {
                        setFieldValue("governmentIdType", idType);
                        setShowIdTypeModal(false);
                      }}
                    >
                      <Text style={[
                        styles.idTypeItemText,
                        values.governmentIdType === idType && styles.idTypeItemTextSelected
                      ]}>
                        {idType}
                      </Text>
                      {values.governmentIdType === idType && (
                        <CheckCircle size={20} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </FormLayout>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  // Sections
  section: {
    backgroundColor: colors.background.primary,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    flex: 1,
  },
  sectionDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },

  // Error handling
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSizes.sm,
    color: colors.error,
    marginLeft: spacing.xs,
  },

  // Select Input
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border.primary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.md,
  },
  selectText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    flex: 1,
  },
  selectPlaceholder: {
    color: colors.text.tertiary,
  },

  // Upload Button
  uploadButton: {
    borderWidth: 2,
    borderColor: colors.border.primary,
    borderStyle: 'dashed',
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    marginBottom: spacing.md,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonSuccess: {
    borderColor: colors.success,
    backgroundColor: colors.background.successSubtle,
    borderStyle: 'solid',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  uploadButtonText: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
    color: colors.primary,
  },
  uploadHint: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Image Preview
  previewContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  imagePreview: {
    width: '100%',
    height: 200,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
  },
  modalCloseButton: {
    padding: spacing.sm,
  },
  modalCloseText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
  },
  idTypeList: {
    maxHeight: 400,
  },
  idTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  idTypeItemSelected: {
    backgroundColor: colors.background.successSubtle,
  },
  idTypeItemText: {
    fontSize: typography.fontSizes.md,
    color: colors.text.primary,
    flex: 1,
  },
  idTypeItemTextSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
  },
});

export default TaxInfoScreen;
