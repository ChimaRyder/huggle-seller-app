import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Image,
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useUser, useAuth } from '@clerk/clerk-expo';
import {
  ArrowLeft,
  Shield,
  Camera,
  FileText,
  User,
  Upload,
  Check,
  AlertCircle,
  X,
} from 'lucide-react-native';
import { colors, spacing, typography, radii } from '@/constants/theme';
import { createRequest, InitialRequest } from '@/utils/data/VerificationController';

const { width } = Dimensions.get('window');


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

const requestMediaLibraryPermissions = async () => {
  if (Platform.OS !== "web") {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
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

const formatFileName = (file: any) => {
  if (!file) return "No file selected";
  if (typeof file === "string") return file;
  if (file.name) {
    const fileName = file.name;
    return fileName.length > 25 ? fileName.substring(0, 22) + "..." : fileName;
  }
  return "File selected";
};


export default function CreateVerificationRequest() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [selectedIdType, setSelectedIdType] = useState('Driver\'s License');
  const [governmentIdImage, setGovernmentIdImage] = useState<any>(null);
  const [businessPermitPdf, setBusinessPermitPdf] = useState<any>(null);
  const [idImageLoading, setIdImageLoading] = useState(false);
  const [permitLoading, setPermitLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const navigateBack = () => {
    if (governmentIdImage || businessPermitPdf) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your verification request?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const uploadPlaceholder = async () => {
    // Simulate upload for demo
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop";
  };

  const handleUploadGovernmentId = async () => {
    try {
      const hasPermission = await requestMediaLibraryPermissions();
      if (!hasPermission) return;

      setIdImageLoading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        const fileSize = selectedImage.fileSize || 0;

        if (fileSize > 5 * 1024 * 1024) {
          Alert.alert(
            "File Too Large",
            "Please select an image smaller than 5MB"
          );
          return;
        }

        try {
          const uploadUrl = await uploadPlaceholder();
          setGovernmentIdImage({
            uri: selectedImage.uri,
            name: selectedImage.fileName || 'government_id.jpg',
            type: selectedImage.mimeType || 'image/jpeg',
            size: fileSize,
            localUri: selectedImage.uri,
            serverUrl: uploadUrl,
          });

          // Clear any previous errors
          setErrors(prev => ({ ...prev, governmentId: '' }));
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

  const handleUploadBusinessPermit = async () => {
    try {
      setPermitLoading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (result.assets && result.assets.length > 0) {
        const selectedDocument = result.assets[0];

        if (selectedDocument.size && selectedDocument.size > 10 * 1024 * 1024) {
          Alert.alert(
            "File Too Large",
            "Please select a PDF smaller than 10MB"
          );
          return;
        }

        try {
          const uploadUrl = await uploadPlaceholder();
          setBusinessPermitPdf({
            uri: selectedDocument.uri,
            name: selectedDocument.name,
            type: selectedDocument.mimeType,
            size: selectedDocument.size,
            serverUrl: uploadUrl,
          });

          // Clear any previous errors
          setErrors(prev => ({ ...prev, businessPermit: '' }));
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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedIdType) {
      newErrors.idType = 'Please select a government ID type';
    }

    if (!governmentIdImage) {
      newErrors.governmentId = 'Government ID image is required';
    }

    if (!businessPermitPdf) {
      newErrors.businessPermit = 'Business permit PDF is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const request = {
        sellerId: user?.id || 'demo-user',
        governmentIdImageUrl: governmentIdImage?.serverUrl || governmentIdImage?.uri,
        governmentIdType: selectedIdType,
        businessPermitPdfUrl: businessPermitPdf?.serverUrl || businessPermitPdf?.uri,
      };

      const token = await getToken({template: "seller_app"});
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing
      const response = await createRequest(token ?? "", request as InitialRequest);

      Alert.alert(
        'Request Submitted!',
        'Your verification request has been submitted successfully. We will review your documents and get back to you within 3-5 business days.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error("Error submitting request: ", error);
      Alert.alert('Error', 'Failed to submit verification request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Verification Request</Text>
          <Text style={styles.headerSubtitle}>Submit your store verification</Text>
        </View>
        <TouchableOpacity
          style={[styles.submitButton, (!governmentIdImage || !businessPermitPdf) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!governmentIdImage || !businessPermitPdf || isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.loadingIndicator} />
          ) : (
            <Check size={20} color={colors.text.inverse} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
      >
        {/* ID Type Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Government ID Type</Text>
          </View>
          <Text style={styles.sectionDescription}>
            Select the type of government-issued ID you will be submitting
          </Text>

          {errors.idType && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.errorText}>{errors.idType}</Text>
            </View>
          )}

          <View style={styles.idTypeGrid}>
            {governmentIdTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.idTypeOption,
                  selectedIdType === type && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                ]}
                onPress={() => setSelectedIdType(type)}
              >
                <Text style={[
                  styles.idTypeText,
                  selectedIdType === type && { color: colors.primary, fontWeight: typography.fontWeights.semibold }
                ]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Government ID Image */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Camera size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Government ID Image</Text>
          </View>
          {errors.governmentId && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.errorText}>{errors.governmentId}</Text>
            </View>
          )}
          <Text style={styles.sectionDescription}>
            Upload a clear, high-quality image of your government ID
          </Text>

          {governmentIdImage ? (
            <View style={styles.uploadedImageContainer}>
              <Image
                source={{ uri: governmentIdImage.localUri || governmentIdImage.uri }}
                style={styles.uploadedImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setGovernmentIdImage(null)}
              >
                <X size={16} color={colors.text.inverse} />
              </TouchableOpacity>
              <View style={styles.imageSuccessOverlay}>
                <Check size={16} color={colors.success} />
                <Text style={styles.imageSuccessText}>Uploaded</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUploadGovernmentId}
              disabled={idImageLoading}
            >
              <Upload size={24} color={colors.primary} />
              <Text style={styles.uploadButtonText}>
                {idImageLoading ? 'Uploading...' : 'Upload Government ID'}
              </Text>
              <Text style={styles.uploadButtonSubtext}>
                JPG, PNG • Max 5MB
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Business Permit PDF */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <FileText size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Business Permit</Text>
          </View>
          {errors.businessPermit && (
            <View style={styles.errorContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.errorText}>{errors.businessPermit}</Text>
            </View>
          )}
          <Text style={styles.sectionDescription}>
            Upload your business permit or DTI registration certificate
          </Text>

          {businessPermitPdf ? (
            <View style={styles.uploadedDocContainer}>
              <View style={styles.docIcon}>
                <FileText size={24} color={colors.primary} />
              </View>
              <View style={styles.docInfo}>
                <Text style={styles.docName}>{businessPermitPdf.name}</Text>
                <Text style={styles.docSize}>
                  {businessPermitPdf.size ? `${(businessPermitPdf.size / 1024 / 1024).toFixed(1)} MB` : 'PDF Document'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.removeDocButton}
                onPress={() => setBusinessPermitPdf(null)}
              >
                <X size={16} color={colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleUploadBusinessPermit}
              disabled={permitLoading}
            >
              <FileText size={24} color={colors.primary} />
              <Text style={styles.uploadButtonText}>
                {permitLoading ? 'Uploading...' : 'Upload Business Permit'}
              </Text>
              <Text style={styles.uploadButtonSubtext}>
                PDF • Max 10MB
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Shield size={20} color={colors.info} />
            <Text style={styles.infoTitle}>Verification Process</Text>
          </View>
          <Text style={styles.infoText}>
            • Your documents will be reviewed within 3-5 business days{"\n"}
            • All information is kept secure and confidential{"\n"}
            • You'll receive an email notification once verification is complete{"\n"}
            • Verified sellers get access to advanced features
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.tertiary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.primary,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.md,
  },
  headerCenter: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSizes.xl,
    fontWeight: typography.fontWeights.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  loadingIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.text.inverse,
    borderTopColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },

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

  // ID Type Selection
  idTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  idTypeOption: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border.primary,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
  },
  idTypeText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },

  // Upload Button
  uploadButton: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    backgroundColor: colors.background.successSubtle,
    borderRadius: radii.lg,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  uploadButtonText: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.semibold,
    marginTop: spacing.sm,
  },
  uploadButtonSubtext: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },

  // Uploaded Image
  uploadedImageContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  uploadedImage: {
    width: '100%',
    height: 200,
    borderRadius: radii.lg,
    backgroundColor: colors.background.secondary,
  },
  removeImageButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageSuccessOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  imageSuccessText: {
    color: colors.text.inverse,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },

  // Uploaded Document
  uploadedDocContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.primary,
  },
  docIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.background.successSubtle,
    borderRadius: radii.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  docSize: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
  },
  removeDocButton: {
    padding: spacing.sm,
  },

  // Info Section
  infoSection: {
    backgroundColor: colors.background.infoSubtle,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  infoTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.semibold,
    color: colors.info,
    marginLeft: spacing.sm,
  },
  infoText: {
    fontSize: typography.fontSizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
