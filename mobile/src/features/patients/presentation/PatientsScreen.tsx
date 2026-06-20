import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { colors } from "@/src/shared/theme/colors";
import { Patient } from "../domain/types";
import { usePatients } from "./usePatients";

const GENDER_LABEL: Record<string, string> = {
  male: "Masculino",
  female: "Femenino",
  other: "Otro",
};

export function PatientsScreen() {
  const router = useRouter();
  const { patients, isLoading, error, refresh } = usePatients();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis pacientes</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/patient-form" as any)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add" size={22} color={colors.onPrimary} />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <MaterialIcons name="error-outline" size={40} color={colors.subtext} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : patients.length === 0 ? (
        <View style={styles.center}>
          <MaterialIcons name="person-outline" size={48} color={colors.outlineVariant} />
          <Text style={styles.emptyTitle}>Sin pacientes</Text>
          <Text style={styles.emptySubtitle}>
            Agrega tu primer paciente con el botón +
          </Text>
        </View>
      ) : (
        <FlatList
          data={patients}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <PatientCard patient={item} />}
        />
      )}
    </View>
  );
}

function PatientCard({ patient }: { patient: Patient }) {
  const initials = patient.full_name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.75}>
      <View style={styles.cardAvatar}>
        <Text style={styles.cardAvatarText}>{initials}</Text>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{patient.full_name}</Text>
        <Text style={styles.cardMeta}>
          {patient.patient_code}
          {patient.computed_age != null ? `  ·  ${patient.computed_age} años` : ""}
          {`  ·  ${GENDER_LABEL[patient.gender] ?? patient.gender}`}
        </Text>
        {(patient.is_smoker || patient.has_previous_bladder_cancer || patient.is_immunosuppressed) && (
          <View style={styles.riskRow}>
            {patient.is_smoker && <RiskChip label="Fumador" />}
            {patient.has_previous_bladder_cancer && <RiskChip label="Ca. vejiga" />}
            {patient.is_immunosuppressed && <RiskChip label="Inmunosup." />}
          </View>
        )}
      </View>
      <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
    </TouchableOpacity>
  );
}

function RiskChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerBtn: { padding: 6 },
  headerTitle: { fontSize: 17, fontWeight: "600", color: colors.text },
  addBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 32 },
  errorText: { fontSize: 14, color: colors.subtext, textAlign: "center" },
  retryBtn: { marginTop: 4, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: colors.primary },
  retryText: { color: colors.onPrimary, fontWeight: "600", fontSize: 14 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
  emptySubtitle: { fontSize: 13, color: colors.subtext, textAlign: "center" },
  list: { padding: 16, gap: 10 },
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: colors.surface, borderRadius: 16, padding: 14,
    borderWidth: 1, borderColor: colors.cardBorder,
    shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 }, elevation: 1, gap: 12,
  },
  cardAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primaryFixed,
    alignItems: "center", justifyContent: "center",
  },
  cardAvatarText: { fontSize: 15, fontWeight: "700", color: colors.primary },
  cardInfo: { flex: 1, gap: 3 },
  cardName: { fontSize: 15, fontWeight: "600", color: colors.text },
  cardMeta: { fontSize: 12, color: colors.subtext },
  riskRow: { flexDirection: "row", gap: 6, marginTop: 2 },
  chip: { backgroundColor: colors.errorContainer, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  chipText: { fontSize: 10, fontWeight: "600", color: colors.onErrorContainer },
});
