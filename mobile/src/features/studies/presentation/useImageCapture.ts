import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

import { ImageSource } from '../domain/types';

export function useImageCapture() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [source, setSource]     = useState<ImageSource | null>(null);
  const [error, setError]       = useState<string | null>(null);

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Se necesita permiso para acceder a la cámara');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setSource('camera');
      setError(null);
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setError('Se necesita permiso para acceder a la galería');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setSource('gallery');
      setError(null);
    }
  };

  const clearImage = () => {
    setImageUri(null);
    setSource(null);
  };

  return { imageUri, source, pickFromCamera, pickFromGallery, clearImage, error };
}
