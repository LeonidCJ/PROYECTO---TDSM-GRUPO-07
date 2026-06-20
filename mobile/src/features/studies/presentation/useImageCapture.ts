import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';

import { studiesRepository } from '../data/studiesRepository';
import { UploadImageResponse } from '../domain/types';

export function useImageCapture(patientId: string) {
  const [imageUri, setImageUri]   = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);

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
      setError(null);
    }
  };

  const analyze = async (): Promise<{ studyId: string; result: UploadImageResponse } | null> => {
    if (!imageUri || !patientId) return null;
    setIsLoading(true);
    setError(null);
    try {
      const study = await studiesRepository.create({ patient: patientId });
      const uploadResult = await studiesRepository.uploadImage(study.id, imageUri);
      return { studyId: study.id, result: uploadResult };
    } catch (e: any) {
      if (e?.message === 'MODEL_UNAVAILABLE') {
        setError('MODEL_UNAVAILABLE');
      } else {
        setError(e?.message ?? 'Error al procesar la imagen');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearImage = () => setImageUri(null);

  return { imageUri, pickFromCamera, pickFromGallery, analyze, clearImage, isLoading, error };
}
