import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/shared/theme';
import { ImageSource, InferenceResult, PrimaryLabel, RiskLevel } from '../domain/types';
import { useRunAnalysis } from './useRunAnalysis';

type Props = {
  patientId: string;
  patientName: string;
  imageUri: string;
  source?: ImageSource;
};

const LABEL_META: Record<PrimaryLabel, { name: string; full: string }> = {
  HGC: { name: 'Cáncer de alto grado', full: 'High Grade Cancer' },
  LGC: { name: 'Cáncer de bajo grado', full: 'Low Grade Cancer' },
  NTL: { name: 'Lesión no tumoral', full: 'Non-Tumor Lesion' },
  NST: { name: 'Tejido normal', full: 'Normal Surrounding Tissue' },
};

const RISK_META: Record<RiskLevel, { label: string; color: string; bg: string }> = {
  high:   { label: 'Riesgo alto',  color: colors.error,   bg: colors.errorLight },
  medium: { label: 'Riesgo medio', color: colors.warning, bg: colors.warningLight },
  low:    { label: 'Riesgo bajo',  color: colors.success, bg: colors.successLight },
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
        <TouchableOpacity onPress={handleHome} style={styles.headerBtn}>
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
        {state === 'result' && inference && <ResultState inference={inference} />}

        {/* ── Actions ────────────────────────────────────── */}
        {(state === 'result' || state === 'unavailable' || state === 'error') && (
          <View style={styles.actionGroup}>
            {state === 'result' && (
              <TouchableOpacity style={styles.primaryAction} onPress={handleGenerateReport} activeOpacity={0.85}>
                <Ionicons name="document-text-outline" size={18} color={colors.white} />
                <Text style={styles.primaryActionText}>Generar informe</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.secondaryAction}
              onPress={handleNewAnalysis}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle-outline" size={18} color={colors.accent} />
              <Text style={styles.secondaryActionText}>Nuevo análisis</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ghostAction} onPress={handleHome} activeOpacity={0.8}>
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

function ResultState({ inference }: { inference: InferenceResult }) {
  const meta = LABEL_META[inference.primary_label];
  const risk = RISK_META[inference.risk_level] ?? RISK_META.low;
  const confidence = inference.confidence_breakdown?.[inference.primary_label] ?? 0;
  const pct = Math.round(confidence * 100);

  return (
    <View style={result.container}>
      {/* Main result card */}
      <View style={[result.card, { borderColor: risk.color + '33', backgroundColor: risk.bg }]}>
        <View style={[result.iconWrap, { backgroundColor: risk.color + '20' }]}>
          <Ionicons
            name={inference.is_malignant ? 'warning-outline' : 'checkmark-circle-outline'}
            size={44}
            color={risk.color}
          />
        </View>
        <Text style={[result.label, { color: risk.color }]}>{meta.name}</Text>
        <View style={result.badgeRow}>
          <View style={[result.codeBadge, { borderColor: risk.color + '55' }]}>
            <Text style={[result.codeBadgeText, { color: risk.color }]}>{inference.primary_label}</Text>
          </View>
          <View style={[result.riskBadge, { backgroundColor: risk.color + '20' }]}>
            <Text style={[result.riskBadgeText, { color: risk.color }]}>{risk.label}</Text>
          </View>
        </View>
        <Text style={result.sublabel}>{meta.full}</Text>
      </View>

      {/* Confidence */}
      <View style={result.confidenceCard}>
        <Text style={result.confidenceLabel}>CONFIANZA DEL MODELO</Text>
        <View style={result.confidenceBar}>
          <View style={[result.confidenceFill, { width: `${pct}%` as any, backgroundColor: risk.color }]} />
        </View>
        <Text style={[result.confidencePct, { color: risk.color }]}>{pct}%</Text>
      </View>

      {/* Recommended action */}
      {inference.recommended_action ? (
        <View style={result.recommendation}>
          <Ionicons name="medkit-outline" size={16} color={colors.accent} />
          <Text style={result.recommendationText}>{inference.recommended_action}</Text>
        </View>
      ) : null}

      {/* Disclaimer */}
      <View style={result.disclaimer}>
        <Ionicons name="information-circle-outline" size={14} color={colors.textDisabled} />
        <Text style={result.disclaimerText}>
          Este resultado es una herramienta de apoyo diagnóstico y no reemplaza el juicio clínico del especialista.
        </Text>
      </View>
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

const result = StyleSheet.create({
  container: { gap: spacing.md },
  card: {
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    padding: spacing.xl,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: { ...typography.title, fontWeight: '800', textAlign: 'center' },
  badgeRow: { flexDirection: 'row', gap: spacing.xs, alignItems: 'center' },
  codeBadge: {
    borderWidth: 1.5,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  codeBadgeText: { ...typography.caption, fontWeight: '800', letterSpacing: 0.5 },
  riskBadge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  riskBadgeText: { ...typography.caption, fontWeight: '700' },
  sublabel: { ...typography.bodySm, color: colors.textSub, textAlign: 'center' },
  confidenceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  confidenceLabel: { ...typography.label, color: colors.textSub },
  confidenceBar: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  confidenceFill: { height: '100%', borderRadius: radius.full },
  confidencePct: { ...typography.title, fontWeight: '800', textAlign: 'right' },
  recommendation: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.accentLight,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent + '22',
  },
  recommendationText: { ...typography.bodySm, color: colors.text, flex: 1, lineHeight: 19 },
  disclaimer: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disclaimerText: { ...typography.caption, color: colors.textDisabled, flex: 1, lineHeight: 17 },
});
