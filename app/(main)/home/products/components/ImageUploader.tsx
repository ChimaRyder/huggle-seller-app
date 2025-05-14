import React, { useState } from "react";
import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import { Icon, Text, Spinner } from "@ui-kitten/components";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { firebase } from "../../../../../fbconfig"; // Import your existing firebase config

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

  // Get Firebase storage reference from your existing config
  const storage = getStorage(firebase);

  const uploadToFirebase = async (uri: string) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create a unique filename with timestamp to prevent collisions
      const filename = uri.substring(uri.lastIndexOf("/") + 1);
      const timestamp = new Date().getTime();
      const uniqueFilename = `product_images/${timestamp}_${filename}`;

      // Create reference to the file location in Firebase Storage
      const storageRef = ref(storage, uniqueFilename);

      // Convert the image to blob for upload
      const response = await fetch(uri);
      const blob = await response.blob();

      // Start the upload task
      const uploadTask = uploadBytesResumable(storageRef, blob);

      // Listen to upload events
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Track upload progress
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          // Handle errors
          console.error("Upload error:", error);
          setIsUploading(false);
        },
        async () => {
          // Upload completed successfully
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          onImageSelected(downloadURL); // Pass the Firebase URL back to parent component
          setIsUploading(false);
        }
      );
    } catch (error) {
      console.error("Error preparing upload:", error);
      setIsUploading(false);
    }
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
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      uploadToFirebase(result.assets[0].uri);
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
          <Text style={styles.text}>{`Uploading... ${Math.round(
            uploadProgress
          )}%`}</Text>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Icon
            name="cloud-upload-outline"
            pack="eva"
            style={styles.icon}
            fill="#8F9BB3"
          />
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
