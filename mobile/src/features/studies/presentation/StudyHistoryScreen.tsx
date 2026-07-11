import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '@/src/shared/theme';
import { formatDateTime } from '@/src/shared/utils/format';
import { PrimaryLabel, Study } from '../domain/types';
import { riskMetaOf } from './resultMeta';
import { useStudiesList } from './useStudiesList';

type Filter = 'ALL' | PrimaryLabel;
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'ALL', label: 'Todos' },
  { key: 'HGC', label: 'HGC' },
  { key: 'LGC', label: 'LGC' },
  { key: 'NTL', label: 'NTL' },
  { key: 'NST', label: 'NST' },
];

export function StudyHistoryScreen() {
  const router = useRouter();
  const { studies, isLoading, error, reload } = useStudiesList();
  const [query, setQuery]   = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return studies.filter((s) => {
      const matchesQuery =
        !q ||
        s.patient_name?.toLowerCase().includes(q) ||
        s.reference_code?.toLowerCase().includes(q);
      const matchesFilter = filter === 'ALL' || s.inference_result?.primary_label === filter;
      return matchesQuery && matchesFilter;
    });
  }, [studies, query, filter]);

  const openStudy = (study: Study) => {
    router.push(
      `/study-detail?studyId=${encodeURIComponent(study.id)}&patientName=${encodeURIComponent(study.patient_name ?? '')}` as any,
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historial</Text>
        <Text style={styles.headerSub}>Estudios y análisis previos</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textSub} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o código..."
          placeholderTextColor={colors.textDisabled}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Buscar estudios por nombre o código"
        />
        {query ? (
          <TouchableOpacity
            onPress={() => setQuery('')}
            accessibilityRole="button"
            accessibilityLabel="Limpiar búsqueda"
          >
            <Ionicons name="close-circle" size={18} color={colors.textDisabled} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
              style={[styles.filterChip, active && styles.filterChipActive]}
              accessibilityRole="button"
              accessibilityLabel={`Filtrar por ${f.label}`}
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading && studies.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(s) => s.id}
          style={styles.flex}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={reload} tintColor={colors.accent} />}
          ListEmptyComponent={
            <View style={styles.center}>
              {error ? (
                <>
                  <Ionicons name="alert-circle-outline" size={36} color={colors.error} />
                  <Text style={styles.emptyText}>{error}</Text>
                </>
              ) : studies.length === 0 ? (
                <>
                  <Ionicons name="folder-open-outline" size={36} color={colors.textDisabled} />
                  <Text style={styles.emptyText}>Aún no tienes estudios registrados.</Text>
                </>
              ) : (
                <>
                  <Ionicons name="search-outline" size={36} color={colors.textDisabled} />
                  <Text style={styles.emptyText}>Sin resultados para tu búsqueda o filtro.</Text>
                </>
              )}
            </View>
          }
          renderItem={({ item }) => <StudyCard study={item} onPress={() => openStudy(item)} />}
        />
      )}
    </View>
  );
}

function StudyCard({ study, onPress }: { study: Study; onPress: () => void }) {
  const inf = study.inference_result;
  const risk = inf ? riskMetaOf(inf.risk_level) : null;
  const accent = risk?.color ?? colors.border;
  const confidence = inf?.confidence_breakdown?.[inf.primary_label];
  const pct = confidence != null ? Math.round(confidence * 100) : null;

  const resultText = inf
    ? `resultado ${inf.primary_label}${pct != null ? `, ${pct} por ciento de confianza` : ''}`
    : 'sin análisis';
  const cardLabel = `Paciente ${study.patient_name ?? 'sin nombre'}, estudio ${study.reference_code}, ${resultText}.`;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      accessible
      accessibilityRole="button"
      accessibilityLabel={cardLabel}
      accessibilityHint="Abre el detalle del estudio"
    >
      <View style={[styles.accentBar, { backgroundColor: accent }]} />
      <View style={styles.cardBody}>
        <Text style={styles.patientName} numberOfLines={1}>{study.patient_name ?? 'Paciente'}</Text>
        <Text style={styles.meta}>#{study.reference_code} · {formatDateTime(study.study_date)}</Text>
        <View style={styles.cardBottom}>
          {inf && risk ? (
            <View style={[styles.chip, { backgroundColor: risk.color + '20' }]}>
              <Text style={[styles.chipText, { color: risk.color }]}>{inf.primary_label}</Text>
            </View>
          ) : (
            <View style={[styles.chip, { backgroundColor: colors.border }]}>
              <Text style={[styles.chipText, { color: colors.textSub }]}>Sin análisis</Text>
            </View>
          )}
          {pct != null ? <Text style={styles.confidence}>{pct}% confianza</Text> : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  headerTitle: { ...typography.title, fontWeight: '800', color: colors.text },
  headerSub: { ...typography.bodySm, color: colors.textSub },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    height: 44,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, ...typography.body, color: colors.text, paddingVertical: 0 },

  filters: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { ...typography.bodySm, fontWeight: '600', color: colors.textSub },
  filterTextActive: { color: colors.white },

  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  emptyText: { ...typography.bodySm, color: colors.textSub, textAlign: 'center' },
  list: { padding: spacing.md, gap: spacing.sm },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    paddingRight: spacing.md,
  },
  accentBar: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: spacing.md, gap: 3 },
  patientName: { ...typography.body, fontWeight: '700', color: colors.text },
  meta: { ...typography.caption, color: colors.textSub },
  cardBottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  chip: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  chipText: { ...typography.caption, fontWeight: '800', letterSpacing: 0.3 },
  confidence: { ...typography.caption, color: colors.textSub },
});
