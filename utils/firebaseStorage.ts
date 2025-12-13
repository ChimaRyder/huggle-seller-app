import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Platform } from 'react-native';

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCNg9o8YZy1lHPb5DfXgrgBl4VTOA0O8uo",
  authDomain: "huggle-goofy-aah.firebaseapp.com",
  projectId: "huggle-goofy-aah",
  storageBucket: "huggle-goofy-aah.firebasestorage.app",
  messagingSenderId: "502979598357",
  appId: "1:502979598357:web:569f85f29b0c2850be161c",
  measurementId: "G-5V30G07X2Y",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export interface UploadResult {
  downloadURL: string;
  fullPath: string;
  name: string;
}

/**
 * Firebase Storage utility for uploading images
 * Handles both iOS and Android file uploads with progress tracking
 */
export class FirebaseStorageService {

  /**
   * Uploads a single image to Firebase Storage
   * @param uri - Local file URI from ImagePicker
   * @param folder - Storage folder path (e.g., 'products', 'stores')
   * @param fileName - Optional custom filename
   * @param onProgress - Optional progress callback
   * @returns Promise<UploadResult>
   */
  static async uploadImage(
    uri: string,
    folder: string = 'products',
    fileName?: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      // Generate unique filename if not provided
      const timestamp = Date.now();
      const fileExtension = uri.split('.').pop() || 'jpg';
      const finalFileName = fileName || `image_${timestamp}.${fileExtension}`;

      // Create storage reference
      const storageRef = ref(storage, `${folder}/${finalFileName}`);

      // Fetch the file data
      const response = await fetch(uri);
      const blob = await response.blob();

      // Start upload task
      const uploadTask = uploadBytesResumable(storageRef, blob);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (onProgress) {
              const progressPercent = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              const progress = {
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                progress: Math.min(progressPercent, 100),
              };

              onProgress(progress);
            }
          },
          (error) => {
            console.error('❌ [FirebaseStorage] Upload failed:', error);
            reject(new Error(`Failed to upload image: ${error.message}`));
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

              resolve({
                downloadURL,
                fullPath: uploadTask.snapshot.ref.fullPath,
                name: finalFileName,
              });
            } catch (error) {
              reject(error);
            }
          }
        );
      });

    } catch (error) {
      console.error('❌ [FirebaseStorage] Upload failed:', error);
      throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Uploads multiple images concurrently
   * @param uris - Array of local file URIs
   * @param folder - Storage folder path
   * @param onProgress - Optional progress callback for overall progress
   * @returns Promise<UploadResult[]>
   */
  static async uploadMultipleImages(
    uris: string[],
    folder: string = 'products',
    onProgress?: (completedCount: number, totalCount: number) => void
  ): Promise<UploadResult[]> {
    try {

      let completedCount = 0;
      const results: UploadResult[] = [];

      // Upload images concurrently
      const uploadPromises = uris.map(async (uri, index) => {
        const result = await this.uploadImage(uri, folder, `image_${Date.now()}_${index}.jpg`);
        completedCount++;

        if (onProgress) {
          onProgress(completedCount, uris.length);
        }

        return result;
      });

      const uploadResults = await Promise.all(uploadPromises);

      return uploadResults;

    } catch (error) {
      console.error('❌ [FirebaseStorage] Multiple upload failed:', error);
      throw new Error(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Uploads a cover image and additional images for a product
   * @param coverImageUri - URI of the cover image
   * @param additionalImageUris - Array of additional image URIs
   * @param productId - Optional product ID for organized storage
   * @param onProgress - Optional progress callback
   * @returns Promise<{coverImageUrl: string, additionalImageUrls: string[]}>
   */
  static async uploadProductImages(
    coverImageUri: string,
    additionalImageUris: string[] = [],
    productId?: string,
    onProgress?: (current: number, total: number) => void
  ): Promise<{ coverImageUrl: string; additionalImageUrls: string[] }> {
    try {
      const folderPath = productId ? `products/${productId}` : 'products';
      const allUris = [coverImageUri, ...additionalImageUris];
      let completedCount = 0;

      // Upload cover image
      const coverImageResult = await this.uploadImage(
        coverImageUri,
        folderPath,
        `cover_${Date.now()}.jpg`,
        () => {
          completedCount++;
          if (onProgress) onProgress(completedCount, allUris.length);
        }
      );

      // Upload additional images
      const additionalImageResults = await Promise.all(
        additionalImageUris.map(async (uri, index) => {
          const result = await this.uploadImage(
            uri,
            folderPath,
            `additional_${index}_${Date.now()}.jpg`,
            () => {
              completedCount++;
              if (onProgress) onProgress(completedCount, allUris.length);
            }
          );
          return result.downloadURL;
        })
      );


      return {
        coverImageUrl: coverImageResult.downloadURL,
        additionalImageUrls: additionalImageResults,
      };

    } catch (error) {
      console.error('❌ [FirebaseStorage] Product image upload failed:', error);
      throw new Error(`Failed to upload product images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes an image from Firebase Storage
   * @param fullPath - Full storage path of the file
   * @returns Promise<void>
   */
  static async deleteImage(fullPath: string): Promise<void> {
    try {
      const storageRef = ref(storage, fullPath);
      await deleteObject(storageRef);

    } catch (error) {
      console.error('❌ [FirebaseStorage] Delete failed:', error);
      throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extracts the storage path from a Firebase download URL
   * @param downloadURL - Firebase download URL
   * @returns Storage path or null if not a valid Firebase URL
   */
  static getStoragePathFromURL(downloadURL: string): string | null {
    try {
      const url = new URL(downloadURL);
      if (url.hostname.includes('firebasestorage.googleapis.com')) {
        const pathMatch = url.pathname.match(/\/o\/(.+?)\?/);
        return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Gets the file size of an uploaded image
   * @param fullPath - Full storage path of the file
   * @returns Promise<number> - File size in bytes
   */
  static async getFileSize(fullPath: string): Promise<number> {
    try {
      const storageRef = ref(storage, fullPath);
      // Note: getMetadata is not available in Web SDK v9
      // For file size, we'd need to use the Admin SDK or store metadata separately
      return 0;
    } catch (error) {
      console.error('❌ [FirebaseStorage] Failed to get file size:', error);
      return 0;
    }
  }
}

export default FirebaseStorageService;