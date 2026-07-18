import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';


import { colors, radius, spacing, typography } from '@/src/shared/theme';
import { Gender, Patient } from '../domain/types';
import { patientsRepository } from '../data/patientsRepository';
import { SegmentedField } from './SegmentedField';
import { usePatients } from './usePatients';
import { usePatientForm } from './usePatientForm';

type Tab = 'search' | 'new';

const GENDERS: { value: Gender; label: string }[] = [
  { value: 'male',   label: 'Masculino' },
  { value: 'female', label: 'Femenino'  },
];

export function PatientSelectScreen() {
  const router  = useRouter();

  const [tab, setTab] = useState<Tab>('search');
  const [query, setQuery] = useState('');

  const { patients, isLoading } = usePatients();
  const { form, update, submit, canSubmit, isLoading: isCreating, error } = usePatientForm();

  const filtered = useMemo(() => {
    if (!query.trim()) return patients;
    const q = query.toLowerCase();
    return patients.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        p.patient_code.toLowerCase().includes(q),
    );
  }, [patients, query]);

  const handleSelect = (patient: Patient) => {
    router.push(`/image-capture?patientId=${patient.id}&patientName=${encodeURIComponent(patient.full_name)}` as any);
  };

  const handleCreate = async () => {
    const newPatient = await submit();
    if (!newPatient) return;
    router.push(`/image-capture?patientId=${(newPatient as any).id}&patientName=${encodeURIComponent((newPatient as any).full_name)}` as any);
  };

  return (
    <View style={styles.container}>
      {/* ── Header ─────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerStep}>Nuevo análisis</Text>
          <Text style={styles.headerTitle}>Paso 1 de 3 — Paciente</Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      {/* ── Tabs ───────────────────────────────────────── */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'search' && styles.tabActive]}
          onPress={() => setTab('search')}
        >
          <Ionicons
            name="search-outline"
            size={15}
            color={tab === 'search' ? colors.accent : colors.textSub}
          />
          <Text style={[styles.tabText, tab === 'search' && styles.tabTextActive]}>
            Buscar paciente
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'new' && styles.tabActive]}
          onPress={() => setTab('new')}
        >
          <Ionicons
            name="person-add-outline"
            size={15}
            color={tab === 'new' ? colors.accent : colors.textSub}
          />
          <Text style={[styles.tabText, tab === 'new' && styles.tabTextActive]}>
            Nuevo paciente
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Tab: Buscar ────────────────────────────────── */}
      {tab === 'search' && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={18} color={colors.textDisabled} />
            <TextInput
              style={styles.searchInput}
              placeholder="Nombre o código del paciente"
              placeholderTextColor={colors.textDisabled}
              value={query}
              onChangeText={setQuery}
              autoCapitalize="none"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Ionicons name="close-circle" size={18} color={colors.textDisabled} />
              </TouchableOpacity>
            )}
          </View>

          {isLoading ? (
            <View style={styles.center}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.center}>
              <Ionicons name="person-outline" size={40} color={colors.textDisabled} />
              <Text style={styles.emptyTitle}>
                {query ? 'Sin resultados' : 'Sin pacientes registrados'}
              </Text>
              <Text style={styles.emptySub}>
                {query ? `No se encontró "${query}"` : 'Usa la pestaña "Nuevo paciente" para crear uno'}
              </Text>
            </View>
          ) : (
            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.patientCard}
                  activeOpacity={0.75}
                  onPress={() => handleSelect(item)}
                >
                  <View style={styles.patientAvatar}>
                    <Text style={styles.patientAvatarText}>
                      {item.full_name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{item.full_name}</Text>
                    <Text style={styles.patientMeta}>
                      {item.patient_code}
                      {item.computed_age != null ? `  ·  ${item.computed_age} años` : ''}
                    </Text>
                  </View>
                  <View style={styles.selectChip}>
                    <Text style={styles.selectChipText}>Seleccionar</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      )}

      {/* ── Tab: Nuevo paciente ────────────────────────── */}
      {tab === 'new' && (
        <ScrollView
          contentContainerStyle={styles.formContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            {/* ID */}
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

            {/* Edad */}
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
                  style={[styles.genderOption, form.gender === g.value && styles.genderOptionActive]}
                  onPress={() => update('gender', g.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.genderLabel, form.gender === g.value && styles.genderLabelActive]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.divider} />
            <Text style={styles.riskTitle}>FACTORES DE RIESGO</Text>

            <SegmentedField
              label="Tabaquismo"
              value={form.smokingStatus}
              onChange={(v) => update('smokingStatus', v)}
              options={[
                { value: 'never', label: 'Nunca' },
                { value: 'former', label: 'Exfumador' },
                { value: 'current', label: 'Fumador' },
              ]}
            />
            <RiskToggle label="Cáncer de vejiga previo" value={form.hasBladderCancer} onChange={(v) => update('hasBladderCancer', v)} />
            <SegmentedField
              label="Hematuria"
              value={form.hematuriaType}
              onChange={(v) => update('hematuriaType', v)}
              options={[
                { value: 'none', label: 'No' },
                { value: 'macroscopic', label: 'Macro' },
                { value: 'microscopic', label: 'Micro' },
              ]}
            />
            <RiskToggle label="Exposición ocupacional" value={form.occupationalExposure} onChange={(v) => update('occupationalExposure', v)} />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleCreate}
            disabled={!canSubmit || isCreating}
            activeOpacity={0.85}
          >
            {isCreating ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Text style={styles.submitText}>Crear y continuar</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.white} />
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

function RiskToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
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
  container: { flex: 1, backgroundColor: colors.background },

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
  headerCenter: { alignItems: 'center' },
  headerStep: { ...typography.caption, color: colors.accent, fontWeight: '700' },
  headerTitle: { ...typography.bodySm, fontWeight: '600', color: colors.text },

  // Tabs
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.accent },
  tabText: { ...typography.bodySm, color: colors.textSub, fontWeight: '600' },
  tabTextActive: { color: colors.accent },

  // Search
  searchContainer: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: { ...typography.heading, color: colors.text },
  emptySub: { ...typography.bodySm, color: colors.textSub, textAlign: 'center' },
  list: { padding: spacing.md, gap: spacing.sm },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patientAvatarText: { ...typography.bodySm, fontWeight: '700', color: colors.accent },
  patientInfo: { flex: 1, gap: 3 },
  patientName: { ...typography.body, fontWeight: '600', color: colors.text },
  patientMeta: { ...typography.caption, color: colors.textSub },
  selectChip: {
    backgroundColor: colors.accentLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  selectChipText: { ...typography.caption, fontWeight: '700', color: colors.accent },

  // Form
  formContent: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
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
  input: { flex: 1, ...typography.body, color: colors.text, padding: 0 },
  stepper: { flexDirection: 'row', alignItems: 'center', marginLeft: spacing.sm },
  stepBtn: { paddingHorizontal: spacing.sm, paddingVertical: 2 },
  stepIcon: { fontSize: 20, color: colors.textSub, lineHeight: 24 },
  stepDivider: { width: 1, height: 18, backgroundColor: colors.border },
  genderRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceMuted,
  },
  genderOption: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  genderOptionActive: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    margin: 3,
  },
  genderLabel: { ...typography.bodySm, color: colors.textSub },
  genderLabelActive: { color: colors.text, fontWeight: '700' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  riskTitle: { ...typography.label, color: colors.textSub },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  toggleLabel: { ...typography.body, color: colors.text },
  error: { ...typography.bodySm, color: colors.error, textAlign: 'center' },
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
  submitText: { ...typography.body, fontWeight: '700', color: colors.white },
});
