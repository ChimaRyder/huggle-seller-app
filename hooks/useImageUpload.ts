import { useState } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import FirebaseStorageService, { UploadProgress } from '../utils/firebaseStorage';

export interface ImageUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export interface UseImageUploadReturn {
  uploadState: ImageUploadState;
  pickAndUploadImage: (folder?: string) => Promise<string | null>;
  pickAndUploadMultipleImages: (folder?: string, maxImages?: number) => Promise<string[]>;
  uploadImageUri: (uri: string, folder?: string) => Promise<string | null>;
  uploadProductImages: (
    coverImageUri: string, 
    additionalImageUris: string[], 
    productId?: string
  ) => Promise<{ coverImageUrl: string; additionalImageUrls: string[] } | null>;
  resetState: () => void;
}

/**
 * Custom hook for handling image uploads to Firebase Storage
 * Provides image picking, uploading, and state management
 */
export const useImageUpload = (): UseImageUploadReturn => {
  const [uploadState, setUploadState] = useState<ImageUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const resetState = () => {
    setUploadState({
      isUploading: false,
      progress: 0,
      error: null,
    });
  };

  const handleProgress = (progress: UploadProgress) => {
    setUploadState(prev => ({
      ...prev,
      progress: progress.progress,
    }));
  };

  /**
   * Picks a single image and uploads it to Firebase Storage
   */
  const pickAndUploadImage = async (folder: string = 'products'): Promise<string | null> => {
    try {
      
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant photo library permissions to upload images.');
        return null;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      if (result.canceled || !result.assets[0]) {
        return null;
      }

      const imageUri = result.assets[0].uri;

      return await uploadImageUri(imageUri, folder);

    } catch (error) {
      console.error('❌ [useImageUpload] Pick and upload failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to pick and upload image';
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
      }));
      
      Alert.alert('Upload Failed', errorMessage);
      return null;
    }
  };

  /**
   * Picks multiple images and uploads them to Firebase Storage
   */
  const pickAndUploadMultipleImages = async (
    folder: string = 'products',
    maxImages: number = 5
  ): Promise<string[]> => {
    try {
      
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant photo library permissions to upload images.');
        return [];
      }

      // Pick multiple images
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: maxImages,
        aspect: [1, 1],
        quality: 0.8,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return [];
      }

      const imageUris = result.assets.map(asset => asset.uri);

      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
      }));

      // Upload multiple images
      const uploadResults = await FirebaseStorageService.uploadMultipleImages(
        imageUris,
        folder,
        (completedCount, totalCount) => {
          const progress = (completedCount / totalCount) * 100;
          setUploadState(prev => ({
            ...prev,
            progress,
          }));
        }
      );

      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
      }));

      return uploadResults.map(result => result.downloadURL);

    } catch (error) {
      console.error('❌ [useImageUpload] Multiple pick and upload failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to pick and upload images';
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
      }));
      
      Alert.alert('Upload Failed', errorMessage);
      return [];
    }
  };

  /**
   * Uploads a specific image URI to Firebase Storage
   */
  const uploadImageUri = async (uri: string, folder: string = 'products'): Promise<string | null> => {
    try {
      
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
      }));

      const result = await FirebaseStorageService.uploadImage(
        uri,
        folder,
        undefined,
        handleProgress
      );

      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
      }));

      return result.downloadURL;

    } catch (error) {
      console.error('❌ [useImageUpload] Upload failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
      }));
      
      Alert.alert('Upload Failed', errorMessage);
      return null;
    }
  };

  /**
   * Uploads product images (cover + additional) with organized folder structure
   */
  const uploadProductImages = async (
    coverImageUri: string,
    additionalImageUris: string[] = [],
    productId?: string
  ): Promise<{ coverImageUrl: string; additionalImageUrls: string[] } | null> => {
    try {
      
      setUploadState(prev => ({
        ...prev,
        isUploading: true,
        progress: 0,
        error: null,
      }));

      const totalImages = 1 + additionalImageUris.length;
      let completedImages = 0;

      const result = await FirebaseStorageService.uploadProductImages(
        coverImageUri,
        additionalImageUris,
        productId,
        (current, total) => {
          const progress = (current / total) * 100;
          setUploadState(prev => ({
            ...prev,
            progress,
          }));
        }
      );

      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        progress: 100,
      }));

      return result;

    } catch (error) {
      console.error('❌ [useImageUpload] Product images upload failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload product images';
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: errorMessage,
      }));
      
      Alert.alert('Upload Failed', errorMessage);
      return null;
    }
  };

  return {
    uploadState,
    pickAndUploadImage,
    pickAndUploadMultipleImages,
    uploadImageUri,
    uploadProductImages,
    resetState,
  };
};

export default useImageUpload;