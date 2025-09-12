import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import { Icon, Text, Spinner, useTheme } from "@ui-kitten/components";
import { CloudUpload } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

interface ImageUploaderProps {
  image: string;
  onImageSelected: (uri: string) => void;
  style?: object;
}

const ImageUploader = ({
  image,
  onImageSelected,
  style,
}: ImageUploaderProps): React.ReactElement => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const theme = useTheme();


  const uploadPlaceholder = async (uri: string) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    alert("Feature Under Development: File upload functionality will be available once the new architecture is implemented.");
    
    // Simulate progress for UX
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          onImageSelected(uri);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleImageSelection = async () => {
    let permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permission to access media library is required!");
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      uploadPlaceholder(result.assets[0].uri);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleImageSelection}
      activeOpacity={0.7}
      disabled={isUploading}
    >
      {image ? (
        <Image source={{ uri: image }} style={styles.image} />
      ) : isUploading ? (
        <View style={styles.placeholder}>
          <Spinner size="medium" />
          <Text style={styles.text}>{`${Math.round(
            uploadProgress
          )}%`}</Text>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <CloudUpload style={styles.icon} color={theme['color-basic-600']}/>
          <Text style={styles.text}>Add or Drop a Photo</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#EDF1F7",
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#F7F9FC",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    color: "#8F9BB3",
    textAlign: "center",
  },
  progressText: {
    marginTop: 8,
    fontSize: 10,
    color: "#8F9BB3",
  },
});

export default ImageUploader;
