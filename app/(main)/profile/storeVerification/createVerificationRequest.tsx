import React, { useState } from 'react';
import { StyleSheet, View, Image, Alert, Platform } from 'react-native';
import { Layout, Text, Button, TopNavigation, TopNavigationAction, Icon, IconProps, IconElement, Select, SelectItem, IndexPath, Spinner } from '@ui-kitten/components';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { createRequest, InitialRequest } from '@/utils/data/VerificationController';

const BackIcon = (props : IconProps) : IconElement => <Icon {...props} name="ArrowLeft" />;

const spinnerIndicator = () => (
  <View style={styles.spinnerContainer}>
    <Spinner size="small" />
  </View>
);

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
  const { user } = useUser();
  const { getToken } = useAuth();

  const [selectedIdType, setSelectedIdType] = useState(new IndexPath(0));
  const [governmentIdImage, setGovernmentIdImage] = useState<any>(null);
  const [businessPermitPdf, setBusinessPermitPdf] = useState<any>(null);

  const [idImageLoading, setIdImageLoading] = useState(false);
  const [permitLoading, setPermitLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ id: 0, permit: 0 });
  const [sending, setSending] = useState(false);

  const renderBackAction = () => (
    <TopNavigationAction icon={BackIcon} onPress={() => router.back()} />
  );

  const uploadPlaceholder = async () => {
    Alert.alert(
      "Feature Under Development", 
      "File upload functionality will be available once the new architecture is implemented."
    );
    return "placeholder-url";
  };

  const handleUploadGovernmentId = async () => {
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
          const fileName = selectedImage.fileName || `government_id.${selectedImage.uri.split(".").pop()}`;
          const fileType = selectedImage.mimeType || `image/${selectedImage.uri.split(".").pop()}`;
          await uploadPlaceholder();
          setGovernmentIdImage({
            uri: selectedImage.uri,
            name: fileName,
            type: fileType,
            size: fileSize,
            localUri: selectedImage.uri,
          });
        } catch (error) {
          Alert.alert(
            "Upload Error",
            "Failed to upload image to server. Please try again."
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
      setUploadProgress((prev) => ({ ...prev, permit: 0 }));
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
          await uploadPlaceholder();
          setBusinessPermitPdf({
            uri: selectedDocument.uri,
            name: selectedDocument.name,
            type: selectedDocument.mimeType,
            size: selectedDocument.size,
          });
        } catch (error) {
          Alert.alert(
            "Upload Error",
            "Failed to upload PDF to server. Please try again."
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

  const handleSend = async () => {
    const request = {
      sellerId: user?.id,
      governmentIdImageUrl: governmentIdImage,
      governmentIdType: governmentIdTypes[selectedIdType.row],
      businessPermitPdfUrl: businessPermitPdf
    }

    try {
      setSending(true);
      const token = await getToken({template: "seller_app"});
      const response = await createRequest(token ?? "", request as InitialRequest);
      
      router.back();
    } catch (error) {
      console.error("Error sending request: ", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout style={styles.container} level="1">
      <SafeAreaView style={styles.container}>
        <TopNavigation
          title="Create Verification Request"
          alignment="center"
          accessoryLeft={renderBackAction}
        />
        <View style={{padding: 20}}>
          <Text category="s1" style={styles.label}>Select Government ID Type</Text>
          <Select
            value={governmentIdTypes[selectedIdType.row]}
            selectedIndex={selectedIdType}
            onSelect={index => setSelectedIdType(index as IndexPath)}
            style={styles.input}
          >
            {governmentIdTypes.map((type, index) => (
              <SelectItem key={index} title={type} />
            ))}
          </Select>

          <Text category="s1" style={styles.label}>Government ID Image</Text>
          <View style={styles.uploadRow}>
            <Text appearance="hint" style={styles.fileName}>
              {formatFileName(governmentIdImage)}
            </Text>
            <Button
              size="small"
              appearance="outline"
              accessoryLeft={idImageLoading ? spinnerIndicator : undefined}
              onPress={handleUploadGovernmentId}
              disabled={idImageLoading}
            >
              {idImageLoading ? `${Math.round(uploadProgress.id)}%` : "Upload"}
            </Button>
          </View>
          {governmentIdImage && (governmentIdImage.localUri || governmentIdImage.uri) && (
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: governmentIdImage.localUri || governmentIdImage.uri }}
                style={styles.imagePreview}
                resizeMode="contain"
              />
            </View>
          )}
          <Text appearance="hint" style={styles.uploadHint}>
            Please upload a clear and readable image of your government ID. Supported file types: JPG, JPEG, PNG. Maximum size: 5MB
          </Text>

          <Text category="s1" style={styles.label}>Business Permit PDF</Text>
          <View style={styles.uploadRow}>
            <Text appearance="hint" style={styles.fileName}>
              {formatFileName(businessPermitPdf)}
            </Text>
            <Button
              size="small"
              appearance="outline"
              accessoryLeft={permitLoading ? spinnerIndicator : undefined}
              onPress={handleUploadBusinessPermit}
              disabled={permitLoading}
            >
              {permitLoading ? `${Math.round(uploadProgress.permit)}%` : "Upload"}
            </Button>
          </View>
          {businessPermitPdf && (
            <View style={styles.pdfIndicator}>
              <Text appearance="hint">PDF document uploaded to server</Text>
            </View>
          )}
          <Text appearance="hint" style={styles.uploadHint}>
            Please upload a PDF copy of your business permit. Supported file type: PDF. Maximum size: 10MB
          </Text>

          <Button style={styles.sendButton} onPress={handleSend} disabled={sending}>
            {sending ? 'Sending...' : 'Send Request'}
          </Button>
        </View>
      </SafeAreaView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    marginBottom: 8,
    marginTop: 8,
  },
  input: {
    marginBottom: 16,
  },
  uploadButton: {
    marginTop: 8,
    marginBottom: 8,
  },
  sendButton: {
    marginTop: 24,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginTop: 8,
  },
  imageSmall: {
    width: 200,
    height: 100,
    borderRadius: 8,
    marginTop: 8,
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
