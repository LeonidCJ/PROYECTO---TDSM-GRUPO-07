import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/shared/theme';
import { InferenceResultCard } from './InferenceResultCard';
import { useStudy } from './useStudy';

type Props = {
  studyId: string;
  patientName: string;
};

export function StudyDetailScreen({ studyId, patientName }: Props) {
  const router = useRouter();
  const { study, isLoading, error } = useStudy(studyId);

  const openReport = () => {
    router.push(
      `/report-detail?studyId=${encodeURIComponent(studyId)}&patientName=${encodeURIComponent(patientName)}` as any,
    );
  };

  const inference = study?.inference_result ?? null;

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
          <Text style={styles.headerStep}>Historial</Text>
          <Text style={styles.headerTitle}>Detalle del estudio</Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.patientRow}>
          <Ionicons name="person-circle-outline" size={16} color={colors.accent} />
          <Text style={styles.patientName}>{patientName}</Text>
          {study?.reference_code ? <Text style={styles.refCode}>#{study.reference_code}</Text> : null}
        </View>

        {isLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={40} color={colors.error} />
            <Text style={styles.msg}>{error}</Text>
          </View>
        ) : inference ? (
          <>
            <InferenceResultCard inference={inference} />
            <TouchableOpacity
              style={styles.primaryAction}
              onPress={openReport}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Ver o generar informe"
            >
              <Ionicons name="document-text-outline" size={18} color={colors.white} />
              <Text style={styles.primaryActionText}>Ver / Generar informe</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.center}>
            <Ionicons name="image-outline" size={40} color={colors.textDisabled} />
            <Text style={styles.msg}>Este estudio aún no tiene un resultado de análisis.</Text>
          </View>
        )}
      </ScrollView>
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
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxl, gap: spacing.sm },
  msg: { ...typography.bodySm, color: colors.textSub, textAlign: 'center' },
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
