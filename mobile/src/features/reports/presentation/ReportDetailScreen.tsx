import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/shared/theme';
import { formatDateTime } from '@/src/shared/utils/format';
import { PrimaryLabel, RiskLevel } from '../../studies/domain/types';
import { Report } from '../domain/types';
import { useReport } from './useReport';

type Props = {
  studyId: string;
  patientName: string;
};

const LABEL_NAME: Record<PrimaryLabel, string> = {
  HGC: 'Cáncer de alto grado',
  LGC: 'Cáncer de bajo grado',
  NTL: 'Lesión no tumoral',
  NST: 'Tejido normal',
};

const RISK_META: Record<RiskLevel, { label: string; color: string }> = {
  high:   { label: 'Riesgo alto',  color: colors.error },
  medium: { label: 'Riesgo medio', color: colors.warning },
  low:    { label: 'Riesgo bajo',  color: colors.success },
};

export function ReportDetailScreen({ studyId, patientName }: Props) {
  const router = useRouter();
  const { state, report, errorMsg, retry } = useReport(studyId);

  const handleDownload = async () => {
    if (report?.pdf_url) await WebBrowser.openBrowserAsync(report.pdf_url);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerStep}>Informe</Text>
          <Text style={styles.headerTitle}>Detalle del informe</Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.patientRow}>
          <Ionicons name="person-circle-outline" size={16} color={colors.accent} />
          <Text style={styles.patientName}>{patientName}</Text>
          {report?.study_reference ? <Text style={styles.refCode}>#{report.study_reference}</Text> : null}
        </View>

        {state === 'generating' && <GeneratingState />}
        {state === 'error' && <ErrorState message={errorMsg} onRetry={retry} />}
        {state === 'ready' && report && <ReadyState report={report} onDownload={handleDownload} />}
      </ScrollView>
    </View>
  );
}

function GeneratingState() {
  return (
    <View style={states.wrap}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text style={states.title}>Generando informe...</Text>
      <Text style={states.sub}>Estamos preparando el PDF del informe médico.</Text>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <View style={states.wrap}>
      <View style={[states.iconWrap, { backgroundColor: colors.errorLight }]}>
        <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
      </View>
      <Text style={states.title}>No se pudo generar el informe</Text>
      <Text style={states.sub}>{message ?? 'Ocurrió un error'}</Text>
      <TouchableOpacity style={styles.primaryAction} onPress={onRetry} activeOpacity={0.85}>
        <Ionicons name="refresh-outline" size={18} color={colors.white} />
        <Text style={styles.primaryActionText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );
}

function ReadyState({ report, onDownload }: { report: Report; onDownload: () => void }) {
  const summary = report.result_summary;
  const risk = summary?.risk_level ? RISK_META[summary.risk_level] : null;
  const pct = summary?.confidence != null ? Math.round(summary.confidence * 100) : null;

  return (
    <View style={{ gap: spacing.md }}>
      {/* Report header card */}
      <View style={card.box}>
        <View style={card.iconRow}>
          <View style={card.iconWrap}>
            <Ionicons name="document-text-outline" size={26} color={colors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={card.title}>Informe generado</Text>
            <Text style={card.code}>{report.reference_code}</Text>
          </View>
          <View style={card.readyBadge}>
            <Text style={card.readyBadgeText}>Listo</Text>
          </View>
        </View>
        <Row label="Institución" value={report.institution_name} />
        <Row label="Fecha" value={formatDateTime(report.generated_at)} />
      </View>

      {/* Result summary */}
      {summary?.primary_label ? (
        <View style={card.box}>
          <Text style={card.section}>Resultado</Text>
          <Text style={[card.resultLabel, { color: risk?.color ?? colors.text }]}>
            {LABEL_NAME[summary.primary_label]}
          </Text>
          <View style={card.badgeRow}>
            <View style={[card.codeBadge, { borderColor: (risk?.color ?? colors.border) + '55' }]}>
              <Text style={[card.codeBadgeText, { color: risk?.color ?? colors.text }]}>
                {summary.primary_label}
              </Text>
            </View>
            {risk ? (
              <View style={[card.riskBadge, { backgroundColor: risk.color + '20' }]}>
                <Text style={[card.riskBadgeText, { color: risk.color }]}>{risk.label}</Text>
              </View>
            ) : null}
            {pct != null ? <Text style={card.confidence}>{pct}% confianza</Text> : null}
          </View>
          {summary.recommended_action ? (
            <Text style={card.recommendation}>{summary.recommended_action}</Text>
          ) : null}
        </View>
      ) : null}

      {/* Download */}
      <TouchableOpacity style={styles.primaryAction} onPress={onDownload} activeOpacity={0.85}>
        <Ionicons name="download-outline" size={18} color={colors.white} />
        <Text style={styles.primaryActionText}>Descargar / Ver PDF</Text>
      </TouchableOpacity>

      <View style={card.disclaimer}>
        <Ionicons name="information-circle-outline" size={14} color={colors.textDisabled} />
        <Text style={card.disclaimerText}>
          Informe de apoyo diagnóstico generado con IA. No reemplaza el juicio clínico del especialista.
        </Text>
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={card.row}>
      <Text style={card.rowLabel}>{label}</Text>
      <Text style={card.rowValue}>{value}</Text>
    </View>
  );
}

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

const card = StyleSheet.create({
  box: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs },
  iconWrap: {
    width: 44, height: 44, borderRadius: radius.md,
    backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  title: { ...typography.body, fontWeight: '700', color: colors.text },
  code: { ...typography.caption, color: colors.textSub },
  readyBadge: {
    backgroundColor: colors.successLight, borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 3,
  },
  readyBadgeText: { ...typography.caption, fontWeight: '700', color: colors.success },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { ...typography.bodySm, color: colors.textSub },
  rowValue: { ...typography.bodySm, color: colors.text, fontWeight: '600', flexShrink: 1, textAlign: 'right' },
  section: { ...typography.label, color: colors.textSub, marginBottom: spacing.xs },
  resultLabel: { ...typography.heading, fontWeight: '800' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs, flexWrap: 'wrap' },
  codeBadge: { borderWidth: 1.5, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  codeBadgeText: { ...typography.caption, fontWeight: '800', letterSpacing: 0.5 },
  riskBadge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  riskBadgeText: { ...typography.caption, fontWeight: '700' },
  confidence: { ...typography.caption, color: colors.textSub },
  recommendation: { ...typography.bodySm, color: colors.text, marginTop: spacing.sm, lineHeight: 19 },
  disclaimer: {
    flexDirection: 'row', gap: spacing.xs,
    backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  disclaimerText: { ...typography.caption, color: colors.textDisabled, flex: 1, lineHeight: 17 },
});
