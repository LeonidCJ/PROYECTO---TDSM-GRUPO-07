import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/shared/theme';
import { ImageSource } from '../domain/types';
import { InferenceResultCard } from './InferenceResultCard';
import { useRunAnalysis } from './useRunAnalysis';

type Props = {
  patientId: string;
  patientName: string;
  imageUri: string;
  source?: ImageSource;
};

export function AnalysisResultScreen({ patientId, patientName, imageUri, source }: Props) {
  const router = useRouter();
  const { state, inference, studyId, referenceCode, errorMsg } = useRunAnalysis({
    patientId,
    imageUri,
    source,
  });

  const handleNewAnalysis = () => router.replace('/patient-select' as any);
  const handleHome        = () => router.replace('/(tabs)' as any);
  const handleGenerateReport = () => {
    if (!studyId) return;
    router.push(
      `/report-detail?studyId=${encodeURIComponent(studyId)}&patientName=${encodeURIComponent(patientName)}` as any,
    );
  };

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleHome}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Ir al inicio"
        >
          <Ionicons name="home-outline" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerStep}>Nuevo análisis</Text>
          <Text style={styles.headerTitle}>Paso 3 de 3 — Resultado</Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ── Patient info ───────────────────────────────── */}
        <View style={styles.patientRow}>
          <Ionicons name="person-circle-outline" size={16} color={colors.accent} />
          <Text style={styles.patientName}>{patientName}</Text>
          {referenceCode ? <Text style={styles.refCode}>#{referenceCode}</Text> : null}
        </View>

        {/* ── States ─────────────────────────────────────── */}
        {state === 'analyzing' && <LoadingState />}
        {state === 'unavailable' && <UnavailableState />}
        {state === 'error' && <ErrorState message={errorMsg} />}
        {state === 'result' && inference && <InferenceResultCard inference={inference} />}

        {/* ── Actions ────────────────────────────────────── */}
        {(state === 'result' || state === 'unavailable' || state === 'error') && (
          <View style={styles.actionGroup}>
            {state === 'result' && (
              <TouchableOpacity
                style={styles.primaryAction}
                onPress={handleGenerateReport}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Generar informe"
              >
                <Ionicons name="document-text-outline" size={18} color={colors.white} />
                <Text style={styles.primaryActionText}>Generar informe</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={handleNewAnalysis}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Nuevo análisis"
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
              <Text style={styles.secondaryActionText}>Nuevo análisis</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.ghostAction}
              onPress={handleHome}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Volver al inicio"
            >
              <Text style={styles.ghostActionText}>Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Steps indicator */}
        <View style={styles.steps}>
          <View style={styles.stepDot} />
          <View style={styles.stepDot} />
          <View style={[styles.stepDot, styles.stepDotActive]} />
        </View>
      </ScrollView>
    </View>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <View style={states.wrap}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={states.title}>Analizando imagen...</Text>
      <Text style={states.sub}>
        El modelo de IA está procesando la muestra.{'\n'}Esto puede tardar unos segundos.
      </Text>
    </View>
  );
}

function UnavailableState() {
  return (
    <View style={states.wrap}>
      <View style={[states.iconWrap, { backgroundColor: colors.warningLight }]}>
        <Ionicons name="cloud-offline-outline" size={40} color={colors.warning} />
      </View>
      <Text style={states.title}>Análisis no disponible</Text>
      <Text style={states.sub}>
        El modelo de inferencia está temporalmente fuera de línea.{'\n'}
        El estudio fue guardado y podrá analizarse cuando el servicio esté disponible.
      </Text>
    </View>
  );
}

function ErrorState({ message }: { message: string | null }) {
  return (
    <View style={states.wrap}>
      <View style={[states.iconWrap, { backgroundColor: colors.errorLight }]}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
      </View>
      <Text style={states.title}>Ocurrió un error</Text>
      <Text style={states.sub}>{message ?? 'No se pudo completar el análisis'}</Text>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
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
  headerCenter: { alignItems: 'center' },
  headerStep: { ...typography.caption, color: colors.accent, fontWeight: '700' },
  headerTitle: { ...typography.bodySm, fontWeight: '600', color: colors.text },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  patientName: { ...typography.body, fontWeight: '600', color: colors.text, flex: 1 },
  refCode: { ...typography.caption, color: colors.textSub },
  actionGroup: { gap: spacing.sm },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 15,
  },
  primaryActionText: { ...typography.body, fontWeight: '700', color: colors.white },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 13,
  },
  secondaryActionText: { ...typography.body, fontWeight: '600', color: colors.accent },
  ghostAction: { alignItems: 'center', paddingVertical: spacing.sm },
  ghostActionText: { ...typography.bodySm, color: colors.textSub },
  steps: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs },
  stepDot: { width: 6, height: 6, borderRadius: radius.full, backgroundColor: colors.border },
  stepDotActive: { width: 20, backgroundColor: colors.accent },
});

const states = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 84,
    height: 84,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...typography.title, color: colors.text, textAlign: 'center' },
  sub: { ...typography.bodySm, color: colors.textSub, textAlign: 'center', lineHeight: 20 },
});
