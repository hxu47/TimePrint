import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';

/**
 * Opens the device gallery to select images
 * @param {Function} setPhotos - State setter function for photos array
 * @returns {Promise<void>}
 */
export const pickImageFromGallery = async (setPhotos) => {
  // Request permission
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please allow access to your photo library');
    return;
  }

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      quality: 0.8,
      aspect: [4, 3],
      maxWidth: 800,
      maxHeight: 600,
    });

    if (!result.canceled) {
      // Add new photos to existing photos (up to 5)
      setPhotos(currentPhotos => {
        const updatedPhotos = [...currentPhotos, ...result.assets];
        return updatedPhotos.slice(0, 5); // Keep maximum 5 photos
      });
    }
  } catch (error) {
    console.error('Error picking image:', error);
    Alert.alert('Error', 'Failed to pick image');
  }
};

/**
 * Opens the device camera to take a photo
 * @param {Function} setPhotos - State setter function for photos array
 * @returns {Promise<void>}
 */
export const takePhotoWithCamera = async (setPhotos) => {
  // Request camera permission
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission needed', 'Please allow access to your camera');
    return;
  }

  try {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      quality: 0.8,
      aspect: [4, 3],
      maxWidth: 800,
      maxHeight: 600,
    });

    if (!result.canceled) {
      // Add new photo to existing photos (up to 5)
      setPhotos(currentPhotos => {
        const updatedPhotos = [...currentPhotos, result.assets[0]];
        return updatedPhotos.slice(0, 5); // Keep maximum 5 photos
      });
    }
  } catch (error) {
    console.error('Error taking photo:', error);
    Alert.alert('Error', 'Failed to take photo');
  }
};