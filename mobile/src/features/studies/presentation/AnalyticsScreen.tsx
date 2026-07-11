import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '@/src/shared/theme';
import { PrimaryLabel, Study } from '../domain/types';
import { computeAnalytics } from './analytics';
import { LABEL_META } from './resultMeta';
import { useStudiesList } from './useStudiesList';

const CLASS_ORDER: PrimaryLabel[] = ['HGC', 'LGC', 'NTL', 'NST'];
const CLASS_COLOR: Record<PrimaryLabel, string> = {
  HGC: colors.error,
  LGC: colors.warning,
  NTL: colors.success,
  NST: colors.accent,
};

export function AnalyticsScreen() {
  const router = useRouter();
  const { studies, isLoading, error, reload } = useStudiesList();
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  }, [reload]);

  const summary = useMemo(() => computeAnalytics(studies), [studies]);
  const maxClass = Math.max(1, ...CLASS_ORDER.map((c) => summary.byClass[c]));

  const openStudy = (study: Study) => {
    router.push(
      `/study-detail?studyId=${encodeURIComponent(study.id)}&patientName=${encodeURIComponent(study.patient_name ?? '')}` as any,
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Análisis</Text>
        <Text style={styles.headerSub}>Resumen de tus resultados</Text>
      </View>

      {isLoading && studies.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        >
          {error ? (
            <View style={styles.emptyBox}>
              <Ionicons name="alert-circle-outline" size={32} color={colors.error} />
              <Text style={styles.emptyText}>{error}</Text>
            </View>
          ) : summary.total === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="bar-chart-outline" size={32} color={colors.textDisabled} />
              <Text style={styles.emptyText}>Aún no tienes análisis registrados.</Text>
            </View>
          ) : (
            <>
              {/* KPIs */}
              <View style={styles.kpiRow}>
                <Kpi label="Estudios" value={summary.total} />
                <Kpi label="Analizados" value={summary.analyzed} />
                <Kpi
                  label="Malignos"
                  value={`${summary.malignantPct}%`}
                  color={summary.malignant > 0 ? colors.error : colors.success}
                />
              </View>

              {/* Distribución por clase */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Distribución por clase</Text>
                {summary.analyzed === 0 ? (
                  <Text style={styles.muted}>Sin resultados de análisis todavía.</Text>
                ) : (
                  CLASS_ORDER.map((c) => (
                    <ClassBar
                      key={c}
                      label={`${c} · ${LABEL_META[c].name}`}
                      count={summary.byClass[c]}
                      max={maxClass}
                      color={CLASS_COLOR[c]}
                    />
                  ))
                )}
              </View>

              {/* Pendientes de reanalizar */}
              {summary.pending > 0 && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Pendientes de reanalizar ({summary.pending})</Text>
                  <Text style={styles.muted}>
                    Estudios cuyo análisis no se completó. Ábrelos para volver a intentarlo.
                  </Text>
                  {summary.pendingStudies.map((s) => (
                    <TouchableOpacity
                      key={s.id}
                      style={styles.pendingRow}
                      onPress={() => openStudy(s)}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel={`Reanalizar estudio ${s.reference_code} de ${s.patient_name ?? 'paciente'}`}
                    >
                      <Ionicons name="refresh-circle-outline" size={20} color={colors.warning} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.pendingName} numberOfLines={1}>{s.patient_name ?? 'Paciente'}</Text>
                        <Text style={styles.pendingMeta}>#{s.reference_code}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function Kpi({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <View style={styles.kpi} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={[styles.kpiValue, color ? { color } : null]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function ClassBar({ label, count, max, color }: { label: string; count: number; max: number; color: string }) {
  const pct = Math.round((count / max) * 100);
  return (
    <View style={styles.barRow} accessible accessibilityLabel={`${label}: ${count}`}>
      <View style={styles.barHead}>
        <Text style={styles.barLabel} numberOfLines={1}>{label}</Text>
        <Text style={styles.barCount}>{count}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  headerTitle: { ...typography.title, fontWeight: '800', color: colors.text },
  headerSub: { ...typography.bodySm, color: colors.textSub },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.xxl },
  emptyText: { ...typography.bodySm, color: colors.textSub, textAlign: 'center' },

  kpiRow: { flexDirection: 'row', gap: spacing.sm },
  kpi: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  kpiValue: { ...typography.title, fontWeight: '800', color: colors.text },
  kpiLabel: { ...typography.caption, color: colors.textSub },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: { ...typography.body, fontWeight: '700', color: colors.text },
  muted: { ...typography.bodySm, color: colors.textSub },

  barRow: { gap: 4, marginTop: spacing.xs },
  barHead: { flexDirection: 'row', justifyContent: 'space-between' },
  barLabel: { ...typography.bodySm, color: colors.text, flex: 1 },
  barCount: { ...typography.bodySm, fontWeight: '700', color: colors.text },
  barTrack: { height: 8, borderRadius: radius.full, backgroundColor: colors.background, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: radius.full },

  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  pendingName: { ...typography.bodySm, fontWeight: '600', color: colors.text },
  pendingMeta: { ...typography.caption, color: colors.textSub },
});
