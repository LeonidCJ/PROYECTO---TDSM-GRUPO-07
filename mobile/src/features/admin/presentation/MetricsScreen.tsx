import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "@/src/shared/theme";
import { auditMetaOf, formatDateTime } from "./auditMeta";
import { useMetrics } from "./useMetrics";

type IoniconName = keyof typeof Ionicons.glyphMap;

export function MetricsScreen() {
  const { metrics, isLoading, refreshing, error, reload, refresh } = useMetrics();

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  if (isLoading && !metrics) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel</Text>
        <Text style={styles.headerSub}>Resumen del sistema</Text>
      </View>

      {error && !metrics ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={36} color={colors.error} />
          <Text style={styles.emptyText}>{error}</Text>
        </View>
      ) : metrics ? (
        <>
          <View style={styles.grid}>
            <StatCard
              icon="people"
              label="Usuarios"
              value={metrics.users.total}
              hint={`${metrics.users.active} activos`}
            />
            <StatCard
              icon="folder-open"
              label="Pacientes"
              value={metrics.patients.active}
              hint={metrics.patients.archived > 0 ? `${metrics.patients.archived} archivados` : "activos"}
            />
            <StatCard
              icon="documents"
              label="Estudios"
              value={metrics.studies.total}
            />
            <StatCard
              icon="document-text"
              label="Informes"
              value={metrics.reports}
            />
          </View>

          <Text style={styles.sectionLabel}>ÚLTIMOS ACCESOS</Text>
          <View style={styles.recentBox}>
            {metrics.recent_logins.length === 0 ? (
              <Text style={styles.emptyText}>Sin accesos recientes.</Text>
            ) : (
              metrics.recent_logins.map((e) => {
                const meta = auditMetaOf(e.event);
                const who = e.user_email || e.email || "Desconocido";
                return (
                  <View key={e.id} style={styles.recentRow}>
                    <Ionicons name={meta.icon} size={16} color={meta.color} />
                    <Text style={styles.recentWho} numberOfLines={1}>{who}</Text>
                    <Text style={styles.recentTime}>{formatDateTime(e.created_at)}</Text>
                  </View>
                );
              })
            )}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: IoniconName;
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <View style={styles.card} accessible accessibilityLabel={`${label}: ${value}${hint ? `, ${hint}` : ""}`}>
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={20} color={colors.accent} />
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
      {hint ? <Text style={styles.cardHint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxl, gap: spacing.sm },

  header: { gap: 2 },
  headerTitle: { ...typography.display, color: colors.text },
  headerSub: { ...typography.caption, color: colors.textSub },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  card: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 4,
  },
  cardIcon: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: colors.accentLight,
    alignItems: "center", justifyContent: "center",
    marginBottom: spacing.xs,
  },
  cardValue: { ...typography.display, color: colors.text },
  cardLabel: { ...typography.bodySm, fontWeight: "700", color: colors.text },
  cardHint: { ...typography.caption, color: colors.textSub },

  sectionLabel: { ...typography.label, color: colors.textSub, marginTop: spacing.sm },
  recentBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  recentRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  recentWho: { ...typography.bodySm, color: colors.text, flex: 1 },
  recentTime: { ...typography.caption, color: colors.textSub },
  emptyText: { ...typography.bodySm, color: colors.textSub, textAlign: "center" },
});
