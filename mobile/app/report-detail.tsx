import { useLocalSearchParams } from 'expo-router';
import { ReportDetailScreen } from '@/src/features/reports/presentation/ReportDetailScreen';

export default function ReportDetailRoute() {
  const { studyId, patientName } = useLocalSearchParams<{
    studyId: string;
    patientName: string;
  }>();
  return (
    <ReportDetailScreen
      studyId={studyId ?? ''}
      patientName={patientName ? decodeURIComponent(patientName) : ''}
    />
  );
}
