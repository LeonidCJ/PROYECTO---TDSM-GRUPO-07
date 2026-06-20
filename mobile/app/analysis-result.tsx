import { useLocalSearchParams } from 'expo-router';
import { AnalysisResultScreen } from '@/src/features/studies/presentation/AnalysisResultScreen';

export default function AnalysisResultRoute() {
  const { studyId, patientName } = useLocalSearchParams<{
    studyId: string;
    patientName: string;
  }>();
  return (
    <AnalysisResultScreen
      studyId={studyId ?? ''}
      patientName={patientName ? decodeURIComponent(patientName) : ''}
    />
  );
}
