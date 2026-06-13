import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { getAccessToken } from "@/src/core/storage/secureStorage";
import { createPatient } from "@/src/features/patients/data/patientsApi";
import { Gender } from "@/src/features/patients/domain/types";
import { colors } from "@/src/shared/theme/colors";

const GENDERS: { value: Gender; label: string }[] = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Femenino" },
  { value: "other", label: "Otro" },
];

export default function PatientFormScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const isAnalysisMode = mode === "analysis";
  const [patientCode, setPatientCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState(0);
  const [gender, setGender] = useState<Gender>("male");
  const [isSmoker, setIsSmoker] = useState(false);
  const [hasBladderCancer, setHasBladderCancer] = useState(false);
  const [isImmunosuppressed, setIsImmunosuppressed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = patientCode.trim() && fullName.trim();

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("No autenticado");
      await createPatient(token, {
        patient_code: patientCode.trim(),
        full_name: fullName.trim(),
        age: age > 0 ? age : undefined,
        gender,
        is_smoker: isSmoker,
        has_previous_bladder_cancer: hasBladderCancer,
        is_immunosuppressed: isImmunosuppressed,
      });
      if (isAnalysisMode) {
        router.push("/image-capture" as any);
      } else {
        router.back();
      }
    } catch (e: any) {
      setError(e?.message ?? "Error al guardar el paciente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isAnalysisMode ? "Nuevo análisis — Paso 1 de 3" : "Nuevo paciente"}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Información del paciente</Text>
        <Text style={styles.sectionSubtitle}>
          Por favor, verifica o ingresa los datos del paciente.
        </Text>

        <View style={styles.card}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="ID del paciente"
              placeholderTextColor={colors.subtext}
              value={patientCode}
              onChangeText={setPatientCode}
              autoCapitalize="characters"
            />
            <MaterialIcons name="qr-code-scanner" size={22} color={colors.subtext} />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor={colors.subtext}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Edad"
              placeholderTextColor={colors.subtext}
              value={age > 0 ? String(age) : ""}
              editable={false}
            />
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setAge((v) => Math.max(0, v - 1))}
              >
                <Text style={styles.stepperIcon}>−</Text>
              </TouchableOpacity>
              <View style={styles.stepperDivider} />
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setAge((v) => Math.min(130, v + 1))}
              >
                <Text style={styles.stepperIcon}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.genderSelector}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[
                  styles.genderOption,
                  gender === g.value && styles.genderOptionActive,
                ]}
                onPress={() => setGender(g.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.genderLabel,
                    gender === g.value && styles.genderLabelActive,
                  ]}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <Text style={styles.riskLabel}>Factores de riesgo</Text>

          <RiskToggle
            label="Fumador"
            value={isSmoker}
            onChange={setIsSmoker}
          />
          <RiskToggle
            label="Cáncer de vejiga previo"
            value={hasBladderCancer}
            onChange={setHasBladderCancer}
          />
          <RiskToggle
            label="Inmunosuprimido"
            value={isImmunosuppressed}
            onChange={setIsImmunosuppressed}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.onPrimary} />
          ) : isAnalysisMode ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={styles.submitText}>Continuar a captura de imagen</Text>
              <MaterialIcons name="arrow-forward" size={18} color={colors.onPrimary} />
            </View>
          ) : (
            <Text style={styles.submitText}>Guardar paciente</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function RiskToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.surfaceContainerHigh, true: colors.primary }}
        thumbColor={colors.onPrimary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  headerBtn: {
    padding: 6,
    width: 36,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.subtext,
    marginBottom: 4,
    lineHeight: 18,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surfaceContainerLowest,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  stepperBtn: {
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  stepperIcon: {
    fontSize: 20,
    color: colors.subtext,
    lineHeight: 24,
  },
  stepperDivider: {
    width: 1,
    height: 18,
    backgroundColor: colors.outlineVariant,
  },
  genderSelector: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.surfaceContainerLow,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  genderOptionActive: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    margin: 3,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  genderLabel: {
    fontSize: 13,
    color: colors.subtext,
    fontWeight: "500",
  },
  genderLabelActive: {
    color: colors.text,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 2,
  },
  riskLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.subtext,
    letterSpacing: 0.4,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  toggleLabel: {
    fontSize: 15,
    color: colors.text,
  },
  error: {
    color: colors.error,
    fontSize: 13,
    textAlign: "center",
  },
  submitBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
});
