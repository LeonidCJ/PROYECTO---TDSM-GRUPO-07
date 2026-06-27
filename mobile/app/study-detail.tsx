import { useLocalSearchParams } from 'expo-router';
import { StudyDetailScreen } from '@/src/features/studies/presentation/StudyDetailScreen';

export default function StudyDetailRoute() {
  const { studyId, patientName } = useLocalSearchParams<{
    studyId: string;
    patientName: string;
  }>();
  return (
    <StudyDetailScreen
      studyId={studyId ?? ''}
      patientName={patientName ? decodeURIComponent(patientName) : ''}
    />
  );
}
