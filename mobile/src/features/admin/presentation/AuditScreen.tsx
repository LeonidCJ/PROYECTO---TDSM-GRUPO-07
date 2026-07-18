import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { colors, radius, spacing, typography } from "@/src/shared/theme";
import { AuditEvent, AuditEventType } from "../domain/types";
import { auditMetaOf, formatDateTime } from "./auditMeta";
import { useAudit } from "./useAudit";

const FILTERS: { label: string; value: AuditEventType | null }[] = [
  { label: "Todos", value: null },
  { label: "Ingresos", value: "login_ok" },
  { label: "Fallidos", value: "login_failed" },
  { label: "Salidas", value: "logout" },
];

export function AuditScreen() {
  const { events, filter, isLoading, refreshing, error, reload, refresh, loadMore, setFilter } =
    useAudit();

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Accesos</Text>
        <Text style={styles.headerSub}>Quién ingresa al sistema</Text>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.value;
          return (
            <TouchableOpacity
              key={f.label}
              onPress={() => setFilter(f.value)}
              style={[styles.filterChip, active && styles.filterChipActive]}
              accessibilityRole="button"
              accessibilityState={active ? { selected: true } : {}}
              accessibilityLabel={`Filtrar por ${f.label}`}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {isLoading && events.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={events}
          keyExtractor={(e) => e.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.accent} />
          }
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          ListEmptyComponent={
            <View style={styles.center}>
              {error ? (
                <>
                  <Ionicons name="alert-circle-outline" size={36} color={colors.error} />
                  <Text style={styles.emptyText}>{error}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="shield-checkmark-outline" size={36} color={colors.textDisabled} />
                  <Text style={styles.emptyText}>Sin registros de acceso.</Text>
                </>
              )}
            </View>
          }
          renderItem={({ item }) => <AuditRow event={item} />}
        />
      )}
    </View>
  );
}

function AuditRow({ event }: { event: AuditEvent }) {
  const meta = auditMetaOf(event.event);
  const who = event.user_email || event.email || "Desconocido";
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${meta.label}, ${who}, ${formatDateTime(event.created_at)}`}
    >
      <View style={[styles.iconWrap, { backgroundColor: meta.color + "20" }]}>
        <Ionicons name={meta.icon} size={18} color={meta.color} />
      </View>
      <View style={styles.body}>
        <Text style={styles.who} numberOfLines={1}>{who}</Text>
        {event.detail ? (
          <Text style={styles.detail} numberOfLines={2}>{event.detail}</Text>
        ) : null}
        <Text style={styles.meta}>
          {formatDateTime(event.created_at)}
          {event.ip_address ? ` · ${event.ip_address}` : ""}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: meta.color + "20" }]}>
        <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.heading, fontWeight: "800", color: colors.text },
  headerSub: { ...typography.caption, color: colors.textSub },

  filterRow: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterText: { ...typography.caption, fontWeight: "600", color: colors.textSub },
  filterTextActive: { color: colors.white },

  center: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.xxl, gap: spacing.sm, flexGrow: 1 },
  emptyText: { ...typography.bodySm, color: colors.textSub, textAlign: "center" },
  list: { padding: spacing.md, gap: spacing.sm },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: radius.md,
    alignItems: "center", justifyContent: "center",
  },
  body: { flex: 1, gap: 2 },
  who: { ...typography.bodySm, fontWeight: "600", color: colors.text },
  detail: { ...typography.caption, color: colors.text, marginTop: 1 },
  meta: { ...typography.caption, color: colors.textSub, marginTop: 1 },
  badge: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  badgeText: { ...typography.caption, fontWeight: "700" },
});
