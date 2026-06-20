import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


import { colors, radius, spacing, typography } from '@/src/shared/theme';
import { Patient } from '../domain/types';
import { usePatients } from './usePatients';

const GENDER_LABEL: Record<string, string> = {
  male:   'Masculino',
  female: 'Femenino',
};

export function PatientsScreen() {
  const router  = useRouter();

  const { patients, isLoading, error, refresh } = usePatients();

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis pacientes</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/patient-form' as any)}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      {/* ── Content ────────────────────────────────────── */}
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
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
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
          {patient.computed_age != null ? `  ·  ${patient.computed_age} años` : ''}
          {`  ·  ${GENDER_LABEL[patient.gender] ?? patient.gender}`}
        </Text>
        {(patient.is_smoker || patient.has_previous_bladder_cancer || patient.is_immunosuppressed) && (
          <View style={styles.chips}>
            {patient.is_smoker               && <RiskChip label="Fumador" />}
            {patient.has_previous_bladder_cancer && <RiskChip label="Ca. vejiga" />}
            {patient.is_immunosuppressed     && <RiskChip label="Inmunosup." />}
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
  headerBtn: { padding: 6 },
  headerTitle: {
    ...typography.heading,
    color: colors.text,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // States
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  errorText: {
    ...typography.bodySm,
    color: colors.textSub,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  retryText: {
    ...typography.bodySm,
    fontWeight: '600',
    color: colors.white,
  },
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
  emptyTitle: {
    ...typography.heading,
    color: colors.text,
  },
  emptySub: {
    ...typography.bodySm,
    color: colors.textSub,
    textAlign: 'center',
  },

  // List
  list: {
    padding: spacing.md,
    gap: spacing.sm,
  },
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
  cardAvatarText: {
    ...typography.bodySm,
    fontWeight: '700',
    color: colors.accent,
  },
  cardInfo: { flex: 1, gap: 3 },
  cardName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  cardMeta: {
    ...typography.caption,
    color: colors.textSub,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: 4,
  },
  chip: {
    backgroundColor: colors.riskBg,
    borderRadius: radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chipText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.riskText,
  },
});
