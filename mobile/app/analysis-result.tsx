import { useLocalSearchParams } from 'expo-router';
import { AnalysisResultScreen } from '@/src/features/studies/presentation/AnalysisResultScreen';
import { ImageSource } from '@/src/features/studies/domain/types';

export default function AnalysisResultRoute() {
  const { patientId, patientName, imageUri, source } = useLocalSearchParams<{
    patientId: string;
    patientName: string;
    imageUri: string;
    source?: string;
  }>();
  return (
    <AnalysisResultScreen
      patientId={patientId ?? ''}
      patientName={patientName ? decodeURIComponent(patientName) : ''}
      imageUri={imageUri ? decodeURIComponent(imageUri) : ''}
      source={source as ImageSource | undefined}
    />
  );
}
