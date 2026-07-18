import { useLocalSearchParams } from "expo-router";

import { PatientFormScreen } from "@/src/features/patients/presentation/PatientFormScreen";

export default function PatientFormRoute() {
  const { mode, patientId } = useLocalSearchParams<{ mode?: string; patientId?: string }>();
  return (
    <PatientFormScreen
      mode={mode === "analysis" ? "analysis" : "standalone"}
      patientId={patientId}
    />
  );
}
