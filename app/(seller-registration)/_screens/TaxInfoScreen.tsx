import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  ImageProps,
} from "react-native";
import {
  Select,
  SelectItem,
  Text,
  Button,
  IndexPath,
  Spinner,
} from "@ui-kitten/components";
import { Formik } from "formik";
import { FormLayout } from "../components/FormLayout";
import { useSellerRegistration } from "../SellerRegistrationContext";
import { taxInfoSchema } from "../../../utils/validationSchemas";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";

const spinnerIndicator = (props : ImageProps) => (
    <View style={[props.style, styles.spinnerContainer]}>
      <Spinner size="small" />
    </View>
);

const TaxInfoScreen = () => {
  const { formData, updateFormData, setCurrentStep } = useSellerRegistration();
  const [selectedIdType, setSelectedIdType] = useState(new IndexPath(0));
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
    updateFormData({
      ...values,
      governmentIdType: governmentIdTypes[selectedIdType.row],
    });
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
          <Text category="s1" style={styles.label}>
            Select Government ID Type
          </Text>

          <Select
            value={governmentIdTypes[selectedIdType.row]}
            selectedIndex={selectedIdType}
            onSelect={(index) => {
              const selectedIndex = index as IndexPath;
              setSelectedIdType(selectedIndex);
              setFieldValue(
                "governmentIdType",
                governmentIdTypes[selectedIndex.row]
              );
            }}
            style={styles.select}
          >
            {governmentIdTypes.map((type, index) => (
              <SelectItem key={index} title={type} />
            ))}
          </Select>

          {touched.governmentIdType && errors.governmentIdType && (
            <Text status="danger" style={styles.errorText}>
              {errors.governmentIdType}
            </Text>
          )}

          <View style={styles.uploadContainer}>
            <Text category="s1" style={styles.label}>
              Government ID Image
            </Text>

            <View style={styles.uploadRow}>
              <Text appearance="hint" style={styles.fileName}>
                {formatFileName(values.governmentIdImage)}
              </Text>

              <Button
                size="small"
                appearance="outline"
                accessoryLeft={
                  idImageLoading
                    ? spinnerIndicator
                    : undefined
                }
                onPress={() => handleUploadGovernmentId(setFieldValue)}
                disabled={idImageLoading}
              >
                {idImageLoading
                  ? `${Math.round(uploadProgress.id)}%`
                  : "Upload"}
              </Button>
            </View>

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

            <Text appearance="hint" style={styles.uploadHint}>
              Please upload a clear and readable image of your government ID.
              Supported file types: JPG, JPEG, PNG. Maximum size: 5MB
            </Text>

            {touched.governmentIdImage && errors.governmentIdImage && (
              <Text status="danger" style={styles.errorText}>
                {String(errors.governmentIdImage)}
              </Text>
            )}
          </View>

          <View style={styles.uploadContainer}>
            <Text category="s1" style={styles.label}>
              Business Permit PDF
            </Text>

            <View style={styles.uploadRow}>
              <Text appearance="hint" style={styles.fileName}>
                {formatFileName(values.businessPermitPdf)}
              </Text>

              <Button
                size="small"
                appearance="outline"
                accessoryLeft={
                  permitLoading
                    ? spinnerIndicator
                    : undefined
                }
                onPress={() => handleUploadBusinessPermit(setFieldValue)}
                disabled={permitLoading}
              >
                {permitLoading
                  ? `${Math.round(uploadProgress.permit)}%`
                  : "Upload"}
              </Button>
            </View>

            {values.businessPermitPdf && (
              <View style={styles.pdfIndicator}>
                <Text appearance="hint">PDF document uploaded to server</Text>
              </View>
            )}

            <Text appearance="hint" style={styles.uploadHint}>
              Please upload a PDF copy of your business permit. Supported file
              type: PDF. Maximum size: 10MB
            </Text>

            {touched.businessPermitPdf && errors.businessPermitPdf && (
              <Text status="danger" style={styles.errorText}>
                {String(errors.businessPermitPdf)}
              </Text>
            )}
          </View>
        </FormLayout>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: 8,
  },
  select: {
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  fileName: {
    flex: 1,
    marginRight: 8,
  },
  uploadHint: {
    fontSize: 12,
    marginTop: 4,
  },
  previewContainer: {
    marginVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  imagePreview: {
    width: "100%",
    height: 180,
    backgroundColor: "#F7F9FC",
  },
  pdfIndicator: {
    marginVertical: 10,
    padding: 12,
    backgroundColor: "#F7F9FC",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8E8E8",
  },
  spinnerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default TaxInfoScreen;
