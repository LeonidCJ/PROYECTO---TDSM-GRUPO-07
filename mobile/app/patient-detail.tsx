import { useLocalSearchParams } from 'expo-router';

import { PatientDetailScreen } from '@/src/features/patients/presentation/PatientDetailScreen';

export default function PatientDetailRoute() {
  const { patientId, patientName } = useLocalSearchParams<{
    patientId: string;
    patientName?: string;
  }>();
  return (
    <PatientDetailScreen
      patientId={patientId ?? ''}
      patientName={patientName ? decodeURIComponent(patientName) : ''}
    />
  );
}
