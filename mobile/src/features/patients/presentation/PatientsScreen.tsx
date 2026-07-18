import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { colors, radius, spacing, typography } from '@/src/shared/theme';
import { Patient } from '../domain/types';
import { followupMetaOf, followupStatus } from './followupMeta';
import { usePatients } from './usePatients';

const GENDER_LABEL: Record<string, string> = {
  male:   'Masculino',
  female: 'Femenino',
};

export function PatientsScreen() {
  const router = useRouter();
  const { patients, isLoading, error, refresh } = usePatients();
  const [query, setQuery] = useState('');

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(
      (p) => p.full_name.toLowerCase().includes(q) || p.patient_code.toLowerCase().includes(q),
    );
  }, [patients, query]);

  const openPatient = (p: Patient) => {
    router.push(
      `/patient-detail?patientId=${encodeURIComponent(p.id)}&patientName=${encodeURIComponent(p.full_name)}` as any,
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis pacientes</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/patient-form' as any)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Agregar paciente"
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textDisabled} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o código"
          placeholderTextColor={colors.textDisabled}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          accessibilityLabel="Buscar pacientes"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} accessibilityLabel="Limpiar búsqueda">
            <Ionicons name="close-circle" size={18} color={colors.textDisabled} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} size="large" />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.textDisabled} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refresh}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : patients.length === 0 ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Ionicons name="person-outline" size={32} color={colors.textDisabled} />
          </View>
          <Text style={styles.emptyTitle}>Sin pacientes</Text>
          <Text style={styles.emptySub}>Agrega tu primer paciente con el botón +</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="search-outline" size={32} color={colors.textDisabled} />
          <Text style={styles.emptySub}>Sin resultados para “{query}”.</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => <PatientCard patient={item} onPress={() => openPatient(item)} />}
        />
      )}
    </View>
  );
}

function PatientCard({ patient, onPress }: { patient: Patient; onPress: () => void }) {
  const initials = patient.full_name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const followStatus = followupStatus(patient.next_followup_date);
  const showFollow = followStatus === 'due' || followStatus === 'soon';
  const followMeta = followupMetaOf(followStatus);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={onPress}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${patient.full_name}, ${patient.patient_code}`}
      accessibilityHint="Abre la ficha del paciente"
    >
      <View style={styles.cardAvatar}>
        <Text style={styles.cardAvatarText}>{initials}</Text>
      </View>

      <View style={styles.cardInfo}>
        <Text style={styles.cardName}>{patient.full_name}</Text>
        <Text style={styles.cardMeta}>
          {patient.patient_code}
          {patient.computed_age != null ? `  ·  ${patient.computed_age} años` : ''}
          {`  ·  ${GENDER_LABEL[patient.gender] ?? patient.gender}`}
        </Text>
        {(patient.smoking_status !== 'never' ||
          patient.has_previous_bladder_cancer ||
          patient.hematuria_type !== 'none' ||
          showFollow) && (
          <View style={styles.chips}>
            {patient.smoking_status === 'current' && <RiskChip label="Fumador" />}
            {patient.smoking_status === 'former' && <RiskChip label="Exfumador" />}
            {patient.has_previous_bladder_cancer && <RiskChip label="Ca. vejiga" />}
            {patient.hematuria_type !== 'none' && <RiskChip label="Hematuria" />}
            {showFollow && (
              <View style={[styles.followChip, { backgroundColor: followMeta.color + '20' }]}>
                <Text style={[styles.followChipText, { color: followMeta.color }]}>{followMeta.label}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: { padding: 6 },
  headerTitle: { ...typography.heading, color: colors.text },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 42,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, ...typography.bodySm, color: colors.text, paddingVertical: 0 },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  errorText: { ...typography.bodySm, color: colors.textSub, textAlign: 'center' },
  retryBtn: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  retryText: { ...typography.bodySm, fontWeight: '600', color: colors.white },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: { ...typography.heading, color: colors.text },
  emptySub: { ...typography.bodySm, color: colors.textSub, textAlign: 'center' },

  list: { padding: spacing.md, gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAvatarText: { ...typography.bodySm, fontWeight: '700', color: colors.accent },
  cardInfo: { flex: 1, gap: 3 },
  cardName: { ...typography.body, fontWeight: '600', color: colors.text },
  cardMeta: { ...typography.caption, color: colors.textSub },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 4 },
  chip: { backgroundColor: colors.riskBg, borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  chipText: { fontSize: 10, fontWeight: '600', color: colors.riskText },
  followChip: { borderRadius: radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  followChipText: { fontSize: 10, fontWeight: '700' },
});
