import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "@/src/shared/theme";
import { formatDate } from "@/src/shared/utils/format";
import { LABEL_META, riskMetaOf } from "@/src/features/studies/presentation/resultMeta";
import { Study } from "@/src/features/studies/domain/types";
import { Patient } from "../domain/types";
import {
  followupMetaOf,
  followupStatus,
  formatFollowupDate,
  isoDatePlusMonths,
} from "./followupMeta";
import { usePatient } from "./usePatient";

const GENDER_LABEL: Record<string, string> = { male: "Masculino", female: "Femenino" };

type Props = { patientId: string; patientName: string };

export function PatientDetailScreen({ patientId, patientName }: Props) {
  const router = useRouter();
  const { patient, studies, isLoading, error, reload, setFollowup, archive } = usePatient(patientId);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const startAnalysis = () => {
    const name = patient?.full_name ?? patientName;
    router.push(
      `/image-capture?patientId=${encodeURIComponent(patientId)}&patientName=${encodeURIComponent(name)}` as any,
    );
  };

  const scheduleFollowup = () => {
    Alert.alert(
      "Programar control",
      "Según el riesgo, la guía EAU sugiere controles a los 3, 6 o 12 meses.",
      [
        { text: "En 3 meses", onPress: () => setFollowup(isoDatePlusMonths(3)).catch(showErr) },
        { text: "En 6 meses", onPress: () => setFollowup(isoDatePlusMonths(6)).catch(showErr) },
        { text: "En 12 meses", onPress: () => setFollowup(isoDatePlusMonths(12)).catch(showErr) },
        ...(patient?.next_followup_date
          ? [{ text: "Quitar control", style: "destructive" as const, onPress: () => setFollowup(null).catch(showErr) }]
          : []),
        { text: "Cancelar", style: "cancel" as const },
      ],
    );
  };

  const confirmArchive = () => {
    Alert.alert(
      "Archivar paciente",
      "El paciente y sus estudios se conservan, pero dejará de aparecer en tu lista. ¿Continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Archivar",
          style: "destructive",
          onPress: async () => {
            try {
              await archive();
              router.back();
            } catch (e: any) {
              showErr(e);
            }
          },
        },
      ],
    );
  };

  const openStudy = (s: Study) => {
    router.push(
      `/study-detail?studyId=${encodeURIComponent(s.id)}&patientName=${encodeURIComponent(patient?.full_name ?? patientName)}` as any,
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Volver">
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ficha del paciente</Text>
        <TouchableOpacity onPress={confirmArchive} style={styles.headerBtn} accessibilityRole="button" accessibilityLabel="Archivar paciente">
          <Ionicons name="archive-outline" size={20} color={colors.textSub} />
        </TouchableOpacity>
      </View>

      {isLoading && !patient ? (
        <View style={styles.center}><ActivityIndicator size="large" color={colors.accent} /></View>
      ) : error && !patient ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={36} color={colors.error} />
          <Text style={styles.msg}>{error}</Text>
        </View>
      ) : patient ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <PatientCard patient={patient} />
          <FollowupCard patient={patient} onSchedule={scheduleFollowup} />

          <TouchableOpacity style={styles.primaryAction} onPress={startAnalysis} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Nuevo análisis para este paciente">
            <Ionicons name="camera-outline" size={18} color={colors.white} />
            <Text style={styles.primaryActionText}>Nuevo análisis</Text>
          </TouchableOpacity>

          <View style={styles.timelineHead}>
            <Text style={styles.sectionLabel}>HISTORIAL DE ESTUDIOS ({studies.length})</Text>
          </View>
          {studies.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="documents-outline" size={28} color={colors.textDisabled} />
              <Text style={styles.msg}>Aún no hay estudios para este paciente.</Text>
            </View>
          ) : (
            studies.map((s, i) => (
              <StudyRow key={s.id} study={s} first={i === 0} onPress={() => openStudy(s)} />
            ))
          )}

          <TouchableOpacity
            style={styles.editLink}
            onPress={() => router.push(`/patient-form?patientId=${encodeURIComponent(patientId)}` as any)}
            accessibilityRole="button"
            accessibilityLabel="Editar datos del paciente"
          >
            <Ionicons name="create-outline" size={16} color={colors.accent} />
            <Text style={styles.editLinkText}>Editar datos del paciente</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : null}
    </View>
  );
}

function showErr(e: any) {
  Alert.alert("No se pudo completar", e?.message ?? "Intenta nuevamente");
}

function PatientCard({ patient }: { patient: Patient }) {
  const initials = patient.full_name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{patient.full_name}</Text>
          <Text style={styles.meta}>
            {patient.patient_code}
            {patient.computed_age != null ? `  ·  ${patient.computed_age} años` : ""}
            {`  ·  ${GENDER_LABEL[patient.gender] ?? patient.gender}`}
          </Text>
        </View>
      </View>
      {(patient.is_smoker || patient.has_previous_bladder_cancer || patient.has_hematuria) && (
        <View style={styles.chips}>
          {patient.is_smoker && <RiskChip label="Fumador" />}
          {patient.has_previous_bladder_cancer && <RiskChip label="Ca. vejiga previo" />}
          {patient.has_hematuria && <RiskChip label="Hematuria" />}
        </View>
      )}
    </View>
  );
}

function FollowupCard({ patient, onSchedule }: { patient: Patient; onSchedule: () => void }) {
  const status = followupStatus(patient.next_followup_date);
  const meta = followupMetaOf(status);
  return (
    <View style={styles.card}>
      <View style={styles.followRow}>
        <View style={[styles.followDot, { backgroundColor: meta.color }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.followLabel}>{meta.label}</Text>
          {patient.next_followup_date ? (
            <Text style={styles.followDate}>{formatFollowupDate(patient.next_followup_date)}</Text>
          ) : (
            <Text style={styles.followDate}>Programa el próximo control</Text>
          )}
        </View>
        <TouchableOpacity style={styles.followBtn} onPress={onSchedule} accessibilityRole="button" accessibilityLabel="Programar control">
          <Text style={styles.followBtnText}>{patient.next_followup_date ? "Cambiar" : "Programar"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StudyRow({ study, first, onPress }: { study: Study; first: boolean; onPress: () => void }) {
  const inf = study.inference_result ?? null;
  const risk = inf ? riskMetaOf(inf.risk_level) : null;
  return (
    <TouchableOpacity
      style={[styles.studyRow, first && styles.studyRowFirst]}
      onPress={onPress}
      activeOpacity={0.8}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`Estudio ${study.reference_code} del ${formatDate(study.study_date)}${inf ? `, ${LABEL_META[inf.primary_label].name}` : ", sin resultado"}`}
    >
      <View style={styles.studyDot} />
      <View style={{ flex: 1 }}>
        <Text style={styles.studyDate}>{formatDate(study.study_date)}</Text>
        <Text style={styles.studyRef}>#{study.reference_code}</Text>
      </View>
      {inf && risk ? (
        <View style={[styles.resultChip, { backgroundColor: risk.color + "20" }]}>
          <Text style={[styles.resultChipText, { color: risk.color }]}>{inf.primary_label}</Text>
        </View>
      ) : (
        <View style={[styles.resultChip, { backgroundColor: colors.background }]}>
          <Text style={[styles.resultChipText, { color: colors.textDisabled }]}>Sin resultado</Text>
        </View>
      )}
      <Ionicons name="chevron-forward" size={16} color={colors.textDisabled} />
    </TouchableOpacity>
  );
}

function RiskChip({ label }: { label: string }) {
  return <View style={styles.riskChip}><Text style={styles.riskChipText}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: spacing.md, paddingVertical: 10,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerBtn: { padding: 6, width: 34, alignItems: "center" },
  headerTitle: { ...typography.body, fontWeight: "700", color: colors.text },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm, padding: spacing.xxl },
  msg: { ...typography.bodySm, color: colors.textSub, textAlign: "center" },

  card: {
    backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1,
    borderColor: colors.border, padding: spacing.md, gap: spacing.sm,
  },
  cardTop: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: {
    width: 48, height: 48, borderRadius: radius.full, backgroundColor: colors.accentLight,
    alignItems: "center", justifyContent: "center",
  },
  avatarText: { ...typography.body, fontWeight: "700", color: colors.accent },
  name: { ...typography.body, fontWeight: "700", color: colors.text },
  meta: { ...typography.caption, color: colors.textSub, marginTop: 2 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
  riskChip: { backgroundColor: colors.riskBg, borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  riskChipText: { fontSize: 11, fontWeight: "600", color: colors.riskText },

  followRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  followDot: { width: 10, height: 10, borderRadius: radius.full },
  followLabel: { ...typography.bodySm, fontWeight: "700", color: colors.text },
  followDate: { ...typography.caption, color: colors.textSub, marginTop: 1 },
  followBtn: {
    paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full,
    borderWidth: 1.5, borderColor: colors.accent,
  },
  followBtnText: { ...typography.caption, fontWeight: "700", color: colors.accent },

  primaryAction: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: spacing.sm,
    backgroundColor: colors.primary, borderRadius: radius.lg, paddingVertical: 15,
  },
  primaryActionText: { ...typography.body, fontWeight: "700", color: colors.white },

  timelineHead: { marginTop: spacing.xs },
  sectionLabel: { ...typography.label, color: colors.textSub },
  emptyBox: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.lg },

  studyRow: {
    flexDirection: "row", alignItems: "center", gap: spacing.sm,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: spacing.md,
  },
  studyRowFirst: {},
  studyDot: { width: 8, height: 8, borderRadius: radius.full, backgroundColor: colors.accent },
  studyDate: { ...typography.bodySm, fontWeight: "600", color: colors.text },
  studyRef: { ...typography.caption, color: colors.textSub },
  resultChip: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  resultChipText: { ...typography.caption, fontWeight: "700" },

  editLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: spacing.md },
  editLinkText: { ...typography.bodySm, fontWeight: "600", color: colors.accent },
});
