import { useLocalSearchParams } from "expo-router";

import { PatientFormScreen } from "@/src/features/patients/presentation/PatientFormScreen";

export default function PatientFormRoute() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  return <PatientFormScreen mode={mode === "analysis" ? "analysis" : "standalone"} />;
}
