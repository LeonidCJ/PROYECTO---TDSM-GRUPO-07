import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/src/core/auth/AuthContext";
import { colors, radius, spacing, typography } from "@/src/shared/theme";
import { AdminUser } from "../domain/types";
import { useUsers } from "./useUsers";

export function UsersScreen() {
  const router = useRouter();
  const { user: current } = useAuth();
  const { users, isLoading, refreshing, error, reload, refresh, loadMore, setSearch, applyPatch } =
    useUsers();
  const [query, setQuery] = useState("");

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  // Debounced server-side search.
  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query, setSearch]);

  const resetPasswordOf = (u: AdminUser) => ({
    text: "Restablecer contraseña",
    onPress: () =>
      router.push(
        `/admin-user-form?mode=reset&userId=${u.id}&email=${encodeURIComponent(u.email)}` as any,
      ),
  });

  const openActions = (u: AdminUser) => {
    const isSelf = current?.id === u.id;
    if (isSelf) {
      Alert.alert("Tu cuenta", "Solo puedes restablecer tu contraseña.", [
        resetPasswordOf(u),
        { text: "Cancelar", style: "cancel" },
      ]);
      return;
    }

    const toRole = u.role === "admin" ? "doctor" : "admin";
    Alert.alert(`${u.first_name} ${u.last_name}`, u.email, [
      {
        text: toRole === "admin" ? "Hacer administrador" : "Hacer médico",
        onPress: async () => {
          const res = await applyPatch(u.id, { role: toRole });
          if (!res.ok) Alert.alert("No se pudo cambiar el rol", res.error);
        },
      },
      {
        text: u.is_active ? "Desactivar cuenta" : "Activar cuenta",
        style: u.is_active ? "destructive" : "default",
        onPress: async () => {
          const res = await applyPatch(u.id, { is_active: !u.is_active });
          if (!res.ok) Alert.alert("No se pudo actualizar", res.error);
        },
      },
      resetPasswordOf(u),
      { text: "Cancelar", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Usuarios</Text>
          <Text style={styles.headerSub}>Gestión de cuentas y roles</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push("/admin-user-form" as any)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Crear usuario"
        >
          <Ionicons name="add" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textDisabled} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre o correo"
          placeholderTextColor={colors.textDisabled}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          accessibilityLabel="Buscar usuarios"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery("")} accessibilityLabel="Limpiar búsqueda">
            <Ionicons name="close-circle" size={18} color={colors.textDisabled} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading && users.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
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
                  <Ionicons name="people-outline" size={36} color={colors.textDisabled} />
                  <Text style={styles.emptyText}>No hay usuarios.</Text>
                </>
              )}
            </View>
          }
          renderItem={({ item }) => (
            <UserCard user={item} isSelf={current?.id === item.id} onPress={() => openActions(item)} />
          )}
        />
      )}
    </View>
  );
}

function UserCard({ user, isSelf, onPress }: { user: AdminUser; isSelf: boolean; onPress: () => void }) {
  const isAdmin = user.role === "admin";
  const roleColor = isAdmin ? colors.accent : colors.textSub;
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
      accessible
      accessibilityRole="button"
      accessibilityLabel={`${user.first_name} ${user.last_name}, ${isAdmin ? "administrador" : "médico"}, ${user.is_active ? "activo" : "inactivo"}`}
      accessibilityHint="Abre las acciones de la cuenta"
    >
      <View style={[styles.avatar, { backgroundColor: roleColor + "20" }]}>
        <Ionicons name={isAdmin ? "shield-checkmark" : "person"} size={18} color={roleColor} />
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {user.first_name} {user.last_name}
          {isSelf ? "  ·  Tú" : ""}
        </Text>
        <Text style={styles.email} numberOfLines={1}>{user.email}</Text>
        <View style={styles.chipRow}>
          <View style={[styles.chip, { backgroundColor: roleColor + "20" }]}>
            <Text style={[styles.chipText, { color: roleColor }]}>
              {isAdmin ? "Administrador" : "Médico"}
            </Text>
          </View>
          {!user.is_active ? (
            <View style={[styles.chip, { backgroundColor: colors.error + "20" }]}>
              <Text style={[styles.chipText, { color: colors.error }]}>Inactivo</Text>
            </View>
          ) : null}
        </View>
      </View>
      <Ionicons name="ellipsis-vertical" size={18} color={colors.textDisabled} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerCenter: { flex: 1 },
  headerTitle: { ...typography.heading, fontWeight: "800", color: colors.text },
  headerSub: { ...typography.caption, color: colors.textSub },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
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

  center: { alignItems: "center", justifyContent: "center", paddingVertical: spacing.xxl, gap: spacing.sm, flexGrow: 1 },
  emptyText: { ...typography.bodySm, color: colors.textSub, textAlign: "center" },
  list: { padding: spacing.md, gap: spacing.sm },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  avatar: {
    width: 40, height: 40, borderRadius: radius.full,
    alignItems: "center", justifyContent: "center",
  },
  body: { flex: 1, gap: 2 },
  name: { ...typography.bodySm, fontWeight: "700", color: colors.text },
  email: { ...typography.caption, color: colors.textSub },
  chipRow: { flexDirection: "row", gap: spacing.xs, marginTop: 2 },
  chip: { borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  chipText: { ...typography.caption, fontWeight: "700" },
});
