import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '@/src/shared/theme';
import { formatDate } from '@/src/shared/utils/format';
import { riskMetaOf } from '../../studies/presentation/resultMeta';
import { Report, ReportStatus } from '../domain/types';
import { useReportsList } from './useReportsList';

const STATUS_META: Record<ReportStatus, { label: string; color: string; bg: string }> = {
  ready:      { label: 'Listo',     color: colors.success, bg: colors.successLight },
  generating: { label: 'Generando', color: colors.warning, bg: colors.warningLight },
  error:      { label: 'Error',     color: colors.error,   bg: colors.errorLight },
};

export function ReportsListScreen() {
  const router = useRouter();
  const { reports, isLoading, error, reload } = useReportsList();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const openReport = async (report: Report) => {
    if (report.status === 'ready' && report.pdf_url) {
      await WebBrowser.openBrowserAsync(report.pdf_url);
    } else {
      router.push(
        `/report-detail?studyId=${encodeURIComponent(report.study)}&patientName=${encodeURIComponent(report.patient_name ?? '')}` as any,
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Volver"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Informes</Text>
          <Text style={styles.headerSub}>Documentos generados</Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      {isLoading && reports.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(r) => r.id}
          style={styles.flex}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
          ListEmptyComponent={
            <View style={styles.center}>
              {error ? (
                <>
                  <Ionicons name="alert-circle-outline" size={36} color={colors.error} />
                  <Text style={styles.emptyText}>{error}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={36} color={colors.textDisabled} />
                  <Text style={styles.emptyText}>Aún no has generado informes.</Text>
                </>
              )}
            </View>
          }
          renderItem={({ item }) => <ReportCard report={item} onPress={() => openReport(item)} />}
        />
      )}
    </View>
  );
}

function ReportCard({ report, onPress }: { report: Report; onPress: () => void }) {
  const status = STATUS_META[report.status] ?? STATUS_META.generating;
  const label = report.result_summary?.primary_label;
  const risk = report.result_summary?.risk_level ? riskMetaOf(report.result_summary.risk_level) : null;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Informe de ${report.patient_name ?? 'paciente'}, ${report.reference_code}, ${status.label}`}
      accessibilityHint={report.status === 'ready' ? 'Abre el PDF del informe' : 'Abre el detalle del informe'}
    >
      <View style={styles.iconWrap}>
        <Ionicons name="document-text-outline" size={20} color={colors.accent} />
      </View>
      <View style={styles.body}>
        <Text style={styles.patient} numberOfLines={1}>{report.patient_name ?? 'Paciente'}</Text>
        <Text style={styles.meta}>{report.reference_code} · {formatDate(report.generated_at)}</Text>
        <View style={styles.chipRow}>
          <View style={[styles.chip, { backgroundColor: status.bg }]}>
            <Text style={[styles.chipText, { color: status.color }]}>{status.label}</Text>
          </View>
          {label && risk ? (
            <View style={[styles.chip, { backgroundColor: risk.color + '20' }]}>
              <Text style={[styles.chipText, { color: risk.color }]}>{label}</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Ionicons
        name={report.status === 'ready' ? 'download-outline' : 'chevron-forward'}
        size={18}
        color={colors.textDisabled}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
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
  headerTitle: { ...typography.body, fontWeight: '700', color: colors.text },
  headerSub: { ...typography.caption, color: colors.textSub },

  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, gap: spacing.sm, flexGrow: 1 },
  emptyText: { ...typography.bodySm, color: colors.textSub, textAlign: 'center' },
  list: { padding: spacing.md, gap: spacing.sm },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  iconWrap: {
    width: 38, height: 38, borderRadius: radius.md,
    backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  body: { flex: 1, gap: 3 },
  patient: { ...typography.body, fontWeight: '600', color: colors.text },
  meta: { ...typography.caption, color: colors.textSub },
  chipRow: { flexDirection: 'row', gap: spacing.xs, marginTop: 2 },
  chip: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  chipText: { ...typography.caption, fontWeight: '700', letterSpacing: 0.2 },
});
