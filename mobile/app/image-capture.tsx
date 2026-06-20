import { useLocalSearchParams } from 'expo-router';
import { ImageCaptureScreen } from '@/src/features/studies/presentation/ImageCaptureScreen';

export default function ImageCaptureRoute() {
  const { patientId, patientName } = useLocalSearchParams<{
    patientId: string;
    patientName: string;
  }>();
  return (
    <ImageCaptureScreen
      patientId={patientId ?? ''}
      patientName={patientName ? decodeURIComponent(patientName) : ''}
    />
  );
}
