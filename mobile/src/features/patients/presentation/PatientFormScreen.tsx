import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


import { colors, radius, spacing, typography } from '@/src/shared/theme';
import { Gender } from '../domain/types';
import { usePatientForm } from './usePatientForm';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male',   label: 'Masculino' },
  { value: 'female', label: 'Femenino'  },
];

type Props = {
  mode?: 'standalone' | 'analysis';
  patientId?: string;
};

export function PatientFormScreen({ mode = 'standalone', patientId }: Props) {
  const router         = useRouter();
  const isAnalysisMode = mode === 'analysis';
  const { form, update, submit, canSubmit, isLoading, isPrefilling, error, isEdit } =
    usePatientForm(patientId);

  const handleSubmit = async () => {
    const patient = await submit();
    if (!patient) return;
    if (isAnalysisMode) {
      router.push(`/image-capture?patientId=${patient.id}&patientName=${encodeURIComponent(patient.full_name)}` as any);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {isEdit ? 'Editar paciente' : isAnalysisMode ? 'Nuevo análisis — Paso 1 de 3' : 'Nuevo paciente'}
        </Text>
        <View style={styles.headerBtn} />
      </View>

      {isPrefilling ? (
        <View style={styles.prefill}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Datos del paciente</Text>
          <Text style={styles.introSub}>
            Verifica o ingresa los datos antes de continuar.
          </Text>
        </View>

        <View style={styles.card}>
          {/* ID paciente */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="ID del paciente"
              placeholderTextColor={colors.textDisabled}
              value={form.patientCode}
              onChangeText={(v) => update('patientCode', v)}
              autoCapitalize="characters"
            />
            <Ionicons name="qr-code-outline" size={20} color={colors.textSub} />
          </View>

          {/* Nombre */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Nombre completo"
              placeholderTextColor={colors.textDisabled}
              value={form.fullName}
              onChangeText={(v) => update('fullName', v)}
              autoCapitalize="words"
            />
          </View>

          {/* Edad stepper */}
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Edad"
              placeholderTextColor={colors.textDisabled}
              value={form.age > 0 ? String(form.age) : ''}
              keyboardType="number-pad"
              onChangeText={(v) => {
                const n = parseInt(v, 10);
                update('age', isNaN(n) ? 0 : Math.min(130, Math.max(0, n)));
              }}
            />
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => update('age', Math.max(0, form.age - 1))}
              >
                <Text style={styles.stepIcon}>−</Text>
              </TouchableOpacity>
              <View style={styles.stepDivider} />
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => update('age', Math.min(130, form.age + 1))}
              >
                <Text style={styles.stepIcon}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Género */}
          <View style={styles.genderRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g.value}
                style={[
                  styles.genderOption,
                  form.gender === g.value && styles.genderOptionActive,
                ]}
                onPress={() => update('gender', g.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.genderLabel,
                    form.gender === g.value && styles.genderLabelActive,
                  ]}
                >
                  {g.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          {/* Factores de riesgo */}
          <Text style={styles.riskTitle}>FACTORES DE RIESGO</Text>

          <RiskToggle
            label="Fumador"
            value={form.isSmoker}
            onChange={(v) => update('isSmoker', v)}
          />
          <RiskToggle
            label="Cáncer de vejiga previo"
            value={form.hasBladderCancer}
            onChange={(v) => update('hasBladderCancer', v)}
          />
          <RiskToggle
            label="Hematuria"
            value={form.hasHematuria}
            onChange={(v) => update('hasHematuria', v)}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* CTA */}
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit || isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : isAnalysisMode ? (
            <>
              <Text style={styles.submitText}>Continuar a captura de imagen</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.white} />
            </>
          ) : (
            <Text style={styles.submitText}>{isEdit ? 'Guardar cambios' : 'Guardar paciente'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
      )}
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
        trackColor={{ false: colors.border, true: colors.accent }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: { padding: 6, width: 34 },
  headerTitle: {
    ...typography.heading,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
  },
  prefill: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Scroll
  scrollContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },

  // Intro
  intro: { gap: 4 },
  introTitle: {
    ...typography.title,
    color: colors.text,
  },
  introSub: {
    ...typography.bodySm,
    color: colors.textSub,
  },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },

  // Inputs
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    backgroundColor: colors.surfaceMuted,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
  },

  // Stepper
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  stepBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  stepIcon: {
    fontSize: 20,
    color: colors.textSub,
    lineHeight: 24,
  },
  stepDivider: {
    width: 1,
    height: 18,
    backgroundColor: colors.border,
  },

  // Gender
  genderRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  genderOptionActive: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    margin: 3,
  },
  genderLabel: {
    ...typography.bodySm,
    color: colors.textSub,
  },
  genderLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },

  // Risk
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  riskTitle: {
    ...typography.label,
    color: colors.textSub,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  toggleLabel: {
    ...typography.body,
    color: colors.text,
  },

  // Error
  error: {
    ...typography.bodySm,
    color: colors.error,
    textAlign: 'center',
  },

  // Submit
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 15,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.white,
  },
});
