import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/src/core/auth/AuthContext";
import { colors } from "@/src/shared/theme/colors";

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const firstName = user?.first_name?.trim() ?? "";
  const lastName = user?.last_name?.trim() ?? "";
  const fullName = [firstName, lastName].filter(Boolean).join(" ");
  const initials = [firstName[0], lastName[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity style={styles.headerBtn}>
          <MaterialIcons name="settings" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.avatarCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.initials}>{initials || "?"}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editBadge}>
              <MaterialIcons name="edit" size={13} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{fullName || "—"}</Text>
          <Text style={styles.role}>Médico</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderIconWrap}>
              <MaterialIcons name="security" size={14} color={colors.primary} />
            </View>
            <Text style={styles.cardLabel}>CUENTA Y SEGURIDAD</Text>
          </View>

          <View style={styles.emailBlock}>
            <View style={styles.emailLabelRow}>
              <Text style={styles.fieldLabel}>CORREO ELECTRÓNICO</Text>
              <View style={styles.lockedBadge}>
                <MaterialIcons name="lock" size={10} color={colors.subtext} />
                <Text style={styles.lockedText}>No editable</Text>
              </View>
            </View>
            <View style={styles.fieldRow}>
              <Text style={styles.fieldValue}>{user?.email ?? "—"}</Text>
              <MaterialIcons name="email" size={18} color={colors.outline} />
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.changePasswordRow} activeOpacity={0.6}>
            <View style={styles.changePasswordLeft}>
              <MaterialIcons name="lock-outline" size={18} color={colors.primary} style={{ marginRight: 10 }} />
              <Text style={styles.changePasswordText}>Cambiar contraseña</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.signOutButton}
          onPress={logout}
          activeOpacity={0.7}
        >
          <MaterialIcons name="logout" size={18} color={colors.error} style={{ marginRight: 8 }} />
          <Text style={styles.signOutText}>Cerrar sesión</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>
          ‡ Herramienta de soporte IA — no reemplaza el juicio del especialista
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: 0.2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },

  // Avatar card
  avatarCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: colors.primaryFixed,
    padding: 3,
  },
  avatar: {
    flex: 1,
    borderRadius: 45,
    backgroundColor: "#CADDEE",
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: 1,
  },
  editBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: colors.surface,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  name: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  role: {
    fontSize: 13,
    color: colors.subtext,
    fontWeight: "500",
  },

  // Info card
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    gap: 8,
  },
  cardHeaderIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.subtext,
    letterSpacing: 1,
  },
  emailBlock: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: 10,
    padding: 12,
    marginBottom: 2,
  },
  emailLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.subtext,
    letterSpacing: 0.8,
  },
  lockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  lockedText: {
    fontSize: 9,
    color: colors.subtext,
    fontWeight: "600",
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldValue: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
    marginRight: 8,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: colors.cardBorder,
    marginVertical: 14,
  },
  changePasswordRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  changePasswordLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  changePasswordText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: "500",
  },

  // Sign out
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: colors.error,
    borderRadius: 14,
    paddingVertical: 15,
    backgroundColor: colors.surface,
    shadowColor: colors.error,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.error,
  },
  footer: {
    fontSize: 11,
    color: colors.outline,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 17,
    paddingHorizontal: 16,
  },
});
